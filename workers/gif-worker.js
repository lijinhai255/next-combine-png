import { Router } from "itty-router";
import GIFEncoder from "gif-encoder-2";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const router = Router();

router.post("/api/create-gif", async (request) => {
  try {
    const width = 400;
    const height = 300;

    // 创建 GIF 编码器
    const encoder = new GIFEncoder(width, height);
    encoder.setDelay(500); // 每帧的延迟
    encoder.setQuality(10); // GIF 质量
    encoder.setRepeat(0); // 无限循环

    // 创建画布和上下文
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 用于存储 GIF 数据的缓冲区
    const gifBuffer = [];

    // 监听 encoder 的数据流，将生成的 GIF 数据存入缓冲区
    encoder.on("data", (chunk) => {
      gifBuffer.push(chunk);
    });

    // 启动编码器
    encoder.start();

    // 加载图片并添加到 GIF
    const imageUrls = [
      "https://next-combine-png.pages.dev/image1.png",
      "https://next-combine-png.pages.dev/image2.png",
      "https://next-combine-png.pages.dev/image3.png",
    ];

    for (const url of imageUrls) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const image = await loadImage(Buffer.from(arrayBuffer));
      ctx.drawImage(image, 0, 0, width, height);
      encoder.addFrame(ctx); // 添加帧到 GIF
    }

    encoder.finish();

    // 将缓冲区数据合并为完整的 GIF
    const gifData = Buffer.concat(gifBuffer);

    // 返回 Base64 编码的 GIF 数据
    return new Response(
      JSON.stringify({
        success: true,
        gif: `data:image/gif;base64,${gifData.toString("base64")}`,
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
