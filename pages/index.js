import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [gifUrl, setGifUrl] = useState(null);

  const createGif = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();

      // 添加图片到 FormData
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`/image${i}.png`);
        const blob = await response.blob();
        formData.append("images", blob);
      }

      const response = await fetch(
        "https://your-worker.workers.dev/api/create-gif",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create GIF");
      }

      const data = await response.json();
      setGifUrl(`https://your-worker.workers.dev/gif/${data.gifId}`);
    } catch (error) {
      console.error("Error:", error);
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
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {isLoading ? "Creating..." : "Create GIF"}
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Original Images:</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <img
              key={num}
              src={`/image${num}.png`}
              alt={`Image ${num}`}
              className="w-48 object-cover"
            />
          ))}
        </div>
      </div>

      {gifUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Generated GIF:</h2>
          <img src={gifUrl} alt="Generated GIF" className="w-96" />
        </div>
      )}
    </div>
  );
}
