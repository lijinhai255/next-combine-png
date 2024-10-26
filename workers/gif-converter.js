import { Router } from "itty-router";

const router = Router();
const CLOUDFLARE_ACCOUNT_ID = "your-account-id"; // 需要替换成你的账号ID
const API_TOKEN = "RY1ZaXwiKjk2YVRB2-MYXbEIY3woB_nw-VotPGKK";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 上传图片到 Cloudflare Images
router.post("/api/upload", async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("No file provided");
    }

    // 创建上传URL请求
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
      throw new Error(data.errors[0]?.message || "Failed to get upload URL");
    }

    // 上传图片
    const uploadResponse = await fetch(data.result.uploadURL, {
      method: "POST",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageId: data.result.id,
        url: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${data.result.id}/public`,
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

// 获取图片列表
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
      throw new Error(data.errors[0]?.message || "Failed to fetch images");
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: data.result.images.map((image) => ({
          id: image.id,
          url: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${image.id}/public`,
          uploaded: image.uploaded,
          filename: image.filename,
        })),
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

// 删除图片
router.delete("/api/images/:id", async (request) => {
  try {
    const { id } = request.params;
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors[0]?.message || "Failed to delete image");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image deleted successfully",
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

router.options("*", () => {
  return new Response(null, {
    headers: corsHeaders,
  });
});

export default {
  fetch: router.handle,
};
