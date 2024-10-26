// workers/gif-worker.js
import { Router } from "itty-router";

const router = Router();

router.post("/api/create-gif", async (request) => {
  try {
    // 从请求中获取图片数据
    const formData = await request.formData();
    const files = formData.getAll("images");

    // 这里你可以选择:
    // 1. 使用 Cloudflare Images API
    // 2. 使用 Cloudflare KV 存储
    // 3. 使用其他图片处理服务

    // 示例：使用 Cloudflare KV 存储
    const gifId = crypto.randomUUID();
    await env.GIF_STORAGE.put(gifId, processedGif);

    return new Response(
      JSON.stringify({
        success: true,
        gifId: gifId,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// 处理 CORS
router.options("*", () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

export default {
  async fetch(request, env, ctx) {
    return router.handle(request);
  },
};
