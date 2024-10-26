export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      // 处理 API 请求
      return new Response("API endpoint", { status: 200 });
    }

    // 其他页面请求
    try {
      const response = await env.ASSETS.fetch(request);
      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};
