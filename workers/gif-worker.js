import { Router } from "itty-router";
import { GifWriter } from "omggif"; // omggif 用于纯 JS 的 GIF 编码

const router = Router();

// 设置 /api/create-gif 路由
router.post("/api/create-gif", async (request, env) => {
  try {
    const width = 400;
    const height = 300;

    // 创建 GIF 缓冲区
    const gifData = new Uint8Array(width * height * 5); // 假设最多包含 5 帧
    const gifWriter = new GifWriter(gifData, width, height, { loop: 0 });

    // 图片文件名
    const imageNames = ["image1.png", "image2.png", "image3.png"];

    for (const name of imageNames) {
      // 从 R2 中读取图片文件
      const object = await env.MY_BUCKET.get(name);
      if (!object) {
        throw new Error(`Image not found: ${name}`);
      }

      const arrayBuffer = await object.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);

      // 将 imageData 绘制到 GIF 帧中（这里假设图像已经符合尺寸要求）
      // 假设每张图片的 `width` x `height` 像素数据已符合要求
      gifWriter.addFrame(0, 0, width, height, imageData, { delay: 50 });
    }

    gifWriter.end(); // 完成 GIF 编码

    // 返回 Base64 编码的 GIF 数据
    const gifBase64 = Buffer.from(gifData).toString("base64");
    return new Response(
      JSON.stringify({
        success: true,
        gif: `data:image/gif;base64,${gifBase64}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// 监听 fetch 事件并处理路由
addEventListener("fetch", (event) => {
  event.respondWith(router.handle(event.request));
});
