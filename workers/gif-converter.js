import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 获取单个图片
router.get("/api/images/:filename", async (request, { env }) => {
  try {
    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    const { filename } = request.params;
    const imagePath = `public/${filename}`;

    const object = await env.MY_BUCKET.get(imagePath);
    if (!object) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Image not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // 获取图片数据并转换为base64
    const arrayBuffer = await object.arrayBuffer();
    const base64Data = btoa(
      String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))
    );

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:${object.httpMetadata.contentType};base64,${base64Data}`,
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

// 获取所有图片
router.get("/api/images", async (request, { env }) => {
  try {
    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    const imageNames = ["image1.png", "image2.png", "image3.png"];
    const images = [];

    for (const filename of imageNames) {
      const imagePath = `public/${filename}`;
      const object = await env.MY_BUCKET.get(imagePath);

      if (object) {
        const arrayBuffer = await object.arrayBuffer();
        const base64Data = btoa(
          String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))
        );

        images.push({
          name: filename,
          url: `data:${object.httpMetadata.contentType};base64,${base64Data}`,
        });
      }
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
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
});

// 添加 fetch 事件处理程序
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, { env, ctx });
  },
};
