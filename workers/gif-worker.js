// workers/gif-worker.js
import { Router } from "itty-router";

const router = Router();

router.post("/api/create-gif", async (request) => {
  console.log("Received request:", request);
  return new Response(
    JSON.stringify({
      status: "success",
      message: "Got the request",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});

// 处理 CORS 预检请求
router.options("*", () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

// 404 handler
router.all("*", () => new Response("Not Found", { status: 404 }));

export default {
  async fetch(request, env, ctx) {
    // 先让我们确认路由是否正常工作
    try {
      return await router.handle(request);
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
  },
};
