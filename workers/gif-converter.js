import { Router } from "itty-router";
import { GIF } from "gifenc";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 创建GIF
router.get("/api/create-gif", async (request, { env }) => {
  try {
    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    // 列出所有图片
    const listed = await env.MY_BUCKET.list({ prefix: "public/" });
    const images = [];

    // 获取所有图片数据
    for (const object of listed.objects) {
      const imageObject = await env.MY_BUCKET.get(object.key);
      if (imageObject) {
        const arrayBuffer = await imageObject.arrayBuffer();
        const response = new Response(arrayBuffer);
        const blob = await response.blob();
        images.push({
          data: blob,
          delay: 500, // 每帧延迟500ms
        });
      }
    }

    // 创建GIF编码器
    const gif = GIF.create({
      width: 800, // GIF宽度
      height: 600, // GIF高度
      quality: 10, // 质量
      repeat: 0, // 循环次数 (0 = 无限循环)
    });

    // 添加每一帧
    for (const image of images) {
      const imageData = await createImageBitmap(image.data);
      const canvas = new OffscreenCanvas(800, 600);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageData, 0, 0, 800, 600);
      const frameData = ctx.getImageData(0, 0, 800, 600);

      gif.addFrame(frameData.data, { delay: image.delay });
    }

    // 完成GIF编码
    const gifData = gif.finish();

    // 返回GIF数据
    return new Response(gifData, {
      headers: {
        "Content-Type": "image/gif",
        ...corsHeaders,
      },
    });
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

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, { env, ctx });
  },
};
