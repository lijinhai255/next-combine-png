// pages/api/upload.js
export const runtime = "edge";

export default async function handler(req) {
  const formData = await req.formData();
  // ... 使用 Web API 而不是 Node.js API
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
