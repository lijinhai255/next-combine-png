import { Router } from "itty-router";

const router = Router();

// Environment variables should be set in your Cloudflare Workers configuration
// const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
// const API_TOKEN = env.API_TOKEN;
// const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS.split(',');

// Secure CORS configuration
const getCorsHeaders = (request) => {
  const origin = request.headers.get("Origin");
  // Check if the origin is in your allowed origins list
  // const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": origin || "*", // In production, replace * with specific origins
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Content-Length",
  };
};

// Utility function to validate image file types
const isValidImageType = (file) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
};

// Get signed URL with proper error handling
async function getDirectUrl(imageId, env) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Set expiry to 1 hour from now
          expiry: Math.floor(Date.now() / 1000) + 3600,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to get direct URL");
    }

    return `https://imagedelivery.net/${env.CLOUDFLARE_ACCOUNT_ID}/${imageId}/public?token=${data.result.token}`;
  } catch (error) {
    console.error("Error getting direct URL:", error);
    throw new Error("Failed to generate image access URL");
  }
}

// Get all images with pagination support
router.get("/api/images", async (request, env) => {
  try {
    const page = parseInt(request.query?.page) || 1;
    const per_page = parseInt(request.query?.per_page) || 30;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1?page=${page}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to fetch images");
    }

    const images = await Promise.all(
      data.result.images.map(async (image) => {
        const directUrl = await getDirectUrl(image.id, env);
        return {
          id: image.id,
          url: directUrl,
          uploaded: image.uploaded,
          filename: image.filename,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        images,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(data.result.total_count / per_page),
          total_count: data.result.total_count,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch images",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  }
});

// Upload image with validation
router.post("/api/upload", async (request, env) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("No file provided");
    }

    if (!isValidImageType(file)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      );
    }

    // Set maximum file size (e.g., 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size exceeds maximum limit of 10MB");
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requireSignedURLs: false,
          metadata: {
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
          },
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to get upload URL");
    }

    const uploadResponse = await fetch(data.result.uploadURL, {
      method: "POST",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    const directUrl = await getDirectUrl(data.result.id, env);

    return new Response(
      JSON.stringify({
        success: true,
        image: {
          id: data.result.id,
          url: directUrl,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  }
});

// Create GIF with input validation
router.post("/api/create-gif", async (request, env) => {
  try {
    const { imageIds, delay = 500, quality = 80 } = await request.json();

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length < 2) {
      throw new Error("Please select at least 2 images");
    }

    if (imageIds.length > 50) {
      throw new Error("Maximum 50 images allowed for GIF creation");
    }

    if (delay < 100 || delay > 5000) {
      throw new Error("Delay must be between 100ms and 5000ms");
    }

    if (quality < 1 || quality > 100) {
      throw new Error("Quality must be between 1 and 100");
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/animate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds: imageIds,
          options: {
            delay: delay,
            loop: 0,
            quality: quality,
          },
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to create GIF");
    }

    const gifUrl = await getDirectUrl(data.result.id, env);

    return new Response(
      JSON.stringify({
        success: true,
        gifUrl: gifUrl,
        gifId: data.result.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  }
});

// Handle preflight requests
router.options("*", (request) => {
  return new Response(null, {
    headers: {
      ...getCorsHeaders(request),
      "Access-Control-Max-Age": "86400",
    },
  });
});

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx),
};
