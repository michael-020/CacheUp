import { GrGallery } from "react-icons/gr";
import { ChangeEvent, FormEvent, useState } from "react";
import { usePostStore } from "@/stores/PostStore/usePostStore";
import { Loader } from "lucide-react";

export default function Share() {
  const { createPost, isUploadingPost } = usePostStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const isLoading = isUploadingPost || isProcessingImage;

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result as string;
      setImagePreview(base64Image);
      setImage(base64Image);
      setIsProcessingImage(false);
    };
    
    reader.onerror = () => {
      alert("Failed to process image");
      setIsProcessingImage(false);
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    
    try {
      await createPost({ text, image });

      setText("");
      setImage("");
      setImagePreview("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const clearImage = () => {
    if (isLoading) return;
    setImagePreview("");
    setImage("");
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (isLoading) return; 
    setText(e.target.value);
  };


  return (
    <div className="w-full md:w-[800px] mx-auto mb-6">
      <div className="relative">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
          <div className="border-b pb-4">
            <textarea
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's on your mind?"
              rows={3}
              value={text}
              onChange={handleTextChange}
              maxLength={200}
              readOnly={isLoading}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {text.length}/200
            </div>
          </div>

          {imagePreview && (
            <div className="my-4 relative">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm hover:bg-gray-200"
                  onClick={clearImage}
                >
                  ×
                </button>
              </div>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 w-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            {!isLoading && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <GrGallery size={20} className="text-gray-600" />
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            
            {isLoading && (
              <div className="flex items-center space-x-2">
                <GrGallery size={20} className="text-gray-400" />
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-black rounded-md font-semibold flex items-center space-x-2 hover:bg-yellow-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || (!text.trim() && !image)}
            >
              {isUploadingPost ? (
                <div className="flex items-center gap-2">
                  <span>Posting</span> <Loader className="size-5 animate-spin" />
                </div>
              ) : isProcessingImage ? (
                <div className="flex items-center gap-2">
                  <span>Processing</span> <Loader className="size-5 animate-spin" />
                </div>
              ) : (
                <span>Post</span>
              )}
            </button>
          </div>
        </form>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-60 rounded-lg flex flex-col items-center justify-center">
            <Loader className="size-8 animate-spin text-yellow-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {isProcessingImage ? "Processing image..." : "Creating your post..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}