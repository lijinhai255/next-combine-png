import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 获取所有图片
router.get("/api/images", async (request, { env }) => {
  try {
    const imageIds = ["image1", "image2", "image3"]; // 图片ID列表
    const images = [];

    for (const id of imageIds) {
      const imageUrl = `https://imagedelivery.net/_BpKI42S7Xd9vwvkNdxbrA/${id}/public`;
      images.push({
        name: `${id}.png`,
        url: imageUrl,
      });
    }

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
        error: "Failed to get images",
        details: error.message,
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

// 上传新图片
router.post("/api/upload", async (request, { env }) => {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      throw new Error("No image provided");
    }

    // 上传到 Cloudflare Images
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/ef96fca5011eaac8a774fcea0a71a67e/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
        body: image,
      }
    );

    const result = await uploadResponse.json();

    if (!result.success) {
      throw new Error(result.errors[0].message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageId: result.result.id,
        imageUrl: `https://imagedelivery.net/_BpKI42S7Xd9vwvkNdxbrA/${result.result.id}/public`,
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
        error: "Failed to upload image",
        details: error.message,
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
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
});

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, { env, ctx });
  },
};
