// workers/gif-worker.js
import { Router } from "itty-router";

const router = Router();

router.post("/api/create-gif", async (request) => {
  try {
    // 打印请求信息以便调试
    console.log("Received request", {
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });

    // 获取表单数据
    const formData = await request.formData();
    const images = formData.getAll("images");

    console.log("Received images:", images.length);

    // 临时返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        message: `Received ${images.length} images`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
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

// CORS 预检请求
router.options("*", () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

export default {
  fetch: async (request) => {
    try {
      return router.handle(request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          details: error.message,
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
  },
};
