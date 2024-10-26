import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  const convertImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebug(null);

      // 创建一个 1x1 像素的红色 PNG 图片数据
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 100, 100);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(0.5, "green");
      gradient.addColorStop(1, "blue");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 100, 100);

      // 转换为 blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const formData = new FormData();
      formData.append("image", blob, "test.png");

      console.log("Sending request with image size:", blob.size);

      const response = await fetch(
        "https://gif-converter.lijinhai255.workers.dev/api/gif-converter",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        setDebug(data.debug || {});
        throw new Error(data.details || `Server error: ${response.status}`);
      }

      if (data.success && data.image) {
        setImageUrl(data.image);
        setDebug(data.debug || {});
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Converter Test</h1>

      <button
        onClick={convertImage}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Test Conversion"}
      </button>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
          <div className="font-bold">Error:</div>
          <div>{error}</div>
        </div>
      )}

      {debug && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="font-bold">Debug Info:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}

      {imageUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Processed Image:</h2>
          <img
            src={imageUrl}
            alt="Processed"
            className="w-96 border-2 border-gray-300 rounded"
            onError={(e) => {
              console.error("Image load error");
              setError("Failed to load processed image");
            }}
          />
        </div>
      )}
    </div>
  );
}
