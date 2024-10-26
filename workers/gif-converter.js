import { Router } from "itty-router";

const router = Router();
const CLOUDFLARE_ACCOUNT_ID = "ef96fca5011eaac8a774fcea0a71a67e";
const API_TOKEN = "RY1ZaXwiKjk2YVRB2-MYXbEIY3woB_nw-VotPGKK";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "*",
};

// 获取直接访问URL
async function getDirectUrl(imageId) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().getTime() + 3600000,
          expiry: Math.floor(Date.now() / 1000) + 3600,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to get direct URL");
    }

    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/public?token=${data.result.token}`;
  } catch (error) {
    console.error("Error getting direct URL:", error);
    throw error;
  }
}

// 获取所有图片
router.get("/api/images", async () => {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to fetch images");
    }

    // 获取每张图片的直接访问URL
    const images = await Promise.all(
      data.result.images.map(async (image) => {
        const directUrl = await getDirectUrl(image.id);
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
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
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
          ...corsHeaders,
        },
      }
    );
  }
});

// 上传图片
router.post("/api/upload", async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("No file provided");
    }

    // 获取上传URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requireSignedURLs: false,
          metadata: {
            file: file.name,
          },
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to get upload URL");
    }

    // 上传图片
    const uploadResponse = await fetch(data.result.uploadURL, {
      method: "POST",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    // 获取直接访问URL
    const directUrl = await getDirectUrl(data.result.id);

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
          ...corsHeaders,
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
          ...corsHeaders,
        },
      }
    );
  }
});

// 创建 GIF
router.post("/api/create-gif", async (request) => {
  try {
    const { imageIds, delay = 500, quality = 80 } = await request.json();

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length < 2) {
      throw new Error("Please select at least 2 images");
    }

    // 创建 GIF
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/animate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
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
    console.log("GIF creation response:", data);

    if (!data.success) {
      throw new Error(data.errors[0]?.message || "Failed to create GIF");
    }

    // 获取 GIF 的直接访问 URL
    const gifUrl = await getDirectUrl(data.result.id);

    return new Response(
      JSON.stringify({
        success: true,
        gifUrl: gifUrl,
        gifId: data.result.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("GIF creation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});

// 处理预检请求
router.options("*", () => {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      "Access-Control-Max-Age": "86400",
    },
  });
});

export default {
  fetch: router.handle,
};
