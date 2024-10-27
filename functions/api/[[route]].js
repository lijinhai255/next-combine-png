import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json", // 确保添加这行
};

// 处理 OPTIONS 请求
router.options("*", () => {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      "Access-Control-Max-Age": "86400",
    },
  });
});

router.get("/api/images", async (request, env) => {
  try {
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.API_TOKEN) {
      throw new Error("Missing required environment variables");
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
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

    return new Response(
      JSON.stringify({ success: true, images: data.result.images }),
      {
        headers: corsHeaders,
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
        headers: corsHeaders,
      }
    );
  }
});

// 404 handler
router.all("*", () => {
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: corsHeaders,
  });
});

export function onRequest(context) {
  return router.handle(context.request, context.env);
}
