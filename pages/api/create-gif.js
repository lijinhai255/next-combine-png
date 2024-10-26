// pages/api/create-gif.js
import GIFEncoder from "gif-encoder-2"; // 注意这里改用了 gif-encoder-2
import { createCanvas, loadImage } from "@napi-rs/canvas"; // 使用 @napi-rs/canvas 替代 canvas
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const width = 400;
    const height = 300;

    const encoder = new GIFEncoder(width, height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const outputPath = path.join(publicDir, "output.gif");
    const writeStream = fs.createWriteStream(outputPath);

    encoder.createReadStream().pipe(writeStream);
    encoder.start();
    encoder.setDelay(500);
    encoder.setQuality(10);
    encoder.setRepeat(0);

    const imageNames = ["image1.png", "image2.png", "image3.png"];

    for (const imageName of imageNames) {
      const imagePath = path.join(publicDir, imageName);
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: `Image not found: ${imageName}` });
      }
      const image = await loadImage(imagePath);
      ctx.drawImage(image, 0, 0, width, height);
      encoder.addFrame(ctx);
    }

    encoder.finish();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
