import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Upload,
  X,
  Check,
  Download,
  Trash2,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [gifSettings, setGifSettings] = useState({
    delay: 500,
    quality: 80,
  });

  // Enhanced error handling utility
  const handleError = useCallback((error, customMessage = null) => {
    const errorMessage = customMessage || error.message;
    setError(errorMessage);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  // Enhanced image fetching with retry logic
  const fetchImages = useCallback(
    async (retryCount = 3) => {
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
        if (retryCount > 0) {
          setTimeout(() => fetchImages(retryCount - 1), 1000);
        } else {
          handleError(err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Enhanced file upload with validation
  const handleUpload = async (event) => {
    try {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        const isValidType = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        return isValidType && isValidSize;
      });

      if (validFiles.length !== files.length) {
        handleError(
          new Error(
            "Some files were skipped. Please ensure all files are images under 10MB."
          )
        );
        if (validFiles.length === 0) return;
      }

      setIsUploading(true);
      setError(null);

      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);

        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }

      await fetchImages();
    } catch (err) {
      handleError(err);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Enhanced delete with confirmation
  const handleDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

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
      handleError(err);
    }
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImages((prev) => {
      const newSelection = prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId];

      // Automatically sort selected images by their position in the images array
      return newSelection.sort((a, b) => {
        const aIndex = images.findIndex((img) => img.id === a);
        const bIndex = images.findIndex((img) => img.id === b);
        return aIndex - bIndex;
      });
    });
  };

  // Enhanced GIF creation with validation
  const createGif = async () => {
    try {
      if (selectedImages.length < 2) {
        throw new Error("Please select at least 2 images");
      }

      if (gifSettings.delay < 100 || gifSettings.delay > 3000) {
        throw new Error("Frame delay must be between 100ms and 3000ms");
      }

      if (gifSettings.quality < 1 || gifSettings.quality > 100) {
        throw new Error("Quality must be between 1 and 100");
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
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Manager & GIF Creator</h1>

      {/* Upload Section */}
      <div className="mb-8">
        <label className="block relative">
          <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                Click or drag files to upload
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, GIF, WebP up to 10MB
              </p>
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
            multiple
            disabled={isUploading}
          />
        </label>

        {isUploading && Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="mb-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GIF Settings */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Settings className="mr-2" />
          <h2 className="text-2xl font-semibold">GIF Settings</h2>
        </div>
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
                    delay: Math.min(
                      3000,
                      Math.max(100, Number(e.target.value))
                    ),
                  }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    quality: Math.min(100, Math.max(1, Number(e.target.value))),
                  }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Create GIF Button */}
      <button
        onClick={createGif}
        disabled={isLoading || selectedImages.length < 2}
        className="mb-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Creating GIF...
          </>
        ) : (
          <>Create GIF ({selectedImages.length} images selected)</>
        )}
      </button>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {images.map((image, index) => (
          <div key={image.id} className="relative group aspect-square">
            <div
              className={`absolute inset-0 ${
                selectedImages.includes(image.id)
                  ? "bg-blue-500 bg-opacity-50"
                  : "bg-black bg-opacity-0 group-hover:bg-opacity-30"
              } transition-all duration-300 rounded-lg cursor-pointer`}
              onClick={() => toggleImageSelection(image.id)}
            >
              {selectedImages.includes(image.id) && (
                <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                  <div className="flex items-center justify-center w-6 h-6 text-white font-medium">
                    {selectedImages.indexOf(image.id) + 1}
                  </div>
                </div>
              )}
            </div>
            <img
              src={image.url}
              alt={image.filename || `Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
              title="Delete image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Generated GIF */}
      {gifUrl && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generated GIF</h2>
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
            <img
              src={gifUrl}
              alt="Generated GIF"
              className="max-w-full mx-auto rounded-lg"
            />
            <div className="mt-4 flex justify-center">
              <a
                href={gifUrl}
                download="animated.gif"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Download className="mr-2" size={20} />
                Download GIF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
