import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [gifSettings, setGifSettings] = useState({
    delay: 500,
    quality: 80,
  });

  // 获取图片列表
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/images");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch images");
      }

      setImages(data.images);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 上传图片
  const handleUpload = async (event) => {
    try {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      setIsUploading(true);
      setError(null);

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Upload failed");
        }
      }

      await fetchImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 删除图片
  const handleDelete = async (imageId) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      setSelectedImages((prev) => prev.filter((id) => id !== imageId));
      await fetchImages();
    } catch (err) {
      setError(err.message);
    }
  };

  // 切换图片选择
  const toggleImageSelection = (imageId) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };

  // 创建 GIF
  const createGif = async () => {
    try {
      if (selectedImages.length < 2) {
        throw new Error("Please select at least 2 images");
      }

      setIsLoading(true);
      setError(null);
      setGifUrl(null);

      const response = await fetch("/api/create-gif", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds: selectedImages,
          ...gifSettings,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create GIF");
      }

      setGifUrl(data.gifUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Manager & GIF Creator</h1>

      {/* 上传区域 */}
      <div className="mb-8">
        <label className="block">
          <span className="sr-only">Choose files</span>
          <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleUpload}
            accept="image/*"
            multiple
            disabled={isUploading}
          />
        </label>
        {isUploading && (
          <div className="mt-2 flex items-center text-blue-600">
            <Loader2 className="animate-spin mr-2" size={16} />
            Uploading...
          </div>
        )}
      </div>

      {/* GIF 设置 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">GIF Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frame Delay (ms)
              <input
                type="number"
                value={gifSettings.delay}
                onChange={(e) =>
                  setGifSettings((prev) => ({
                    ...prev,
                    delay: Number(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                min="100"
                max="3000"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quality (1-100)
              <input
                type="number"
                value={gifSettings.quality}
                onChange={(e) =>
                  setGifSettings((prev) => ({
                    ...prev,
                    quality: Number(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                min="1"
                max="100"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 创建 GIF 按钮 */}
      <button
        onClick={createGif}
        disabled={isLoading || selectedImages.length < 2}
        className="mb-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Creating GIF...
          </>
        ) : (
          "Create GIF"
        )}
      </button>

      {/* 图片网格 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div
              className={`absolute inset-0 ${
                selectedImages.includes(image.id)
                  ? "bg-blue-500 bg-opacity-50"
                  : "bg-black bg-opacity-0 group-hover:bg-opacity-30"
              } transition-all duration-300 rounded-lg`}
              onClick={() => toggleImageSelection(image.id)}
            >
              {selectedImages.includes(image.id) && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
            <img
              src={image.url}
              alt={image.filename}
              className="w-full aspect-square object-cover rounded-lg cursor-pointer"
            />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 生成的 GIF */}
      {gifUrl && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generated GIF</h2>
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img
              src={gifUrl}
              alt="Generated GIF"
              className="max-w-full mx-auto"
            />
            <div className="mt-4 flex justify-center">
              <a
                href={gifUrl}
                download="animated.gif"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Download GIF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-semibold text-red-600">Error:</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
