// pages/index.js
import { useState } from "react";

const images = ["/image1.png", "/image2.png", "/image3.png"];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);

  const createGif = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/create-gif", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create GIF");
      }

      // 添加时间戳来避免缓存
      setGifUrl(`/output.gif?t=${new Date().getTime()}`);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PNG to GIF Converter</h1>

      <button
        onClick={createGif}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50 hover:bg-blue-600"
      >
        {isLoading ? "Creating..." : "Create GIF"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Original PNGs:</h2>
        <div className="flex gap-4 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="border p-2 rounded">
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-48 h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {gifUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Generated GIF:</h2>
          <div className="border p-2 rounded inline-block">
            <img src={gifUrl} alt="Generated GIF" className="w-96 h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
