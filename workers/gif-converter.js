import { Router } from "itty-router";
import { GifWriter } from "omggif";

const router = Router();

// 设置 /api/gif-converter 路由
router.post("/api/gif-converter", async (request, env) => {
  console.log("Environment Variables:", env); // 检查 env 对象

  // 检查 R2 存储桶是否绑定
  if (!env.MY_BUCKET) {
    console.error("MY_BUCKET is not defined in environment");
    return new Response(
      JSON.stringify({ success: false, error: "R2 bucket not found" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        status: 500,
      }
    );
  }

  try {
    const width = 400;
    const height = 300;

    // 创建 GIF 缓冲区
    const gifData = new Uint8Array(width * height * 5);
    const gifWriter = new GifWriter(gifData, width, height, { loop: 0 });

    // 图片文件路径
    const imageNames = [
      "public/image1.png",
      "public/image2.png",
      "public/image3.png",
    ];

    for (const name of imageNames) {
      // 从 R2 中读取图片文件
      console.log(`Fetching image from R2: ${name}`);
      const object = await env.MY_BUCKET.get(name);
      if (!object) {
        throw new Error(`Image not found: ${name}`);
      }

      const arrayBuffer = await object.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      gifWriter.addFrame(0, 0, width, height, imageData, { delay: 50 });
    }

    gifWriter.end(); // 完成 GIF 编码

    // 将 GIF 编码结果转换为 Base64
    const gifBase64 = Buffer.from(gifData).toString("base64");
    return new Response(
      JSON.stringify({
        success: true,
        gif: `data:image/gif;base64,${gifBase64}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // 允许所有来源
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error during GIF creation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // 允许所有来源
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        status: 500,
      }
    );
  }
});

// 处理 OPTIONS 预检请求（解决 CORS 问题）
router.options("/api/gif-converter", () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*", // 允许所有来源
      "Access-Control-Allow-Methods": "POST, OPTIONS", // 允许的方法
      "Access-Control-Allow-Headers": "Content-Type", // 允许的请求头
    },
  });
});

// 全局错误处理，确保所有响应中包含 CORS 头
addEventListener("fetch", (event) => {
  event.respondWith(
    router.handle(event.request).catch((error) => {
      console.error("Unhandled error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Internal Server Error" }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // 允许所有来源
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          status: 500,
        }
      );
    })
  );
});
