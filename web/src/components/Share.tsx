import { GrGallery } from "react-icons/gr";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { usePostStore } from "@/stores/PostStore/usePostStore";
import { Loader } from "lucide-react";
import { Textarea } from "./ui/textarea";

export default function Share() {
  const { createPost, isUploadingPost } = usePostStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  
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
    <div className="w-full lg:w-[550px] xl:w-[700px] mx-auto mb-6">
      <div className="relative">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="border-b dark:border-gray-700 pb-1">
            <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  readOnly={isLoading}
                  placeholder="What's on your mind?"
                  className="w-full px-3 border dark:bg-neutral-600 rounded-md resize-none overflow-y-auto min-h-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-right text-xs pt-1 text-gray-500 ">
              {text.length}/200
            </div>
          </div>

          {imagePreview && (
            <div className="my-4 relative">
              <div className="flex justify-start">
                <button
                  type="button"
                  className="absolute ml-24 -left-2 bg-white rounded-full px-2 py-1 shadow-sm dark:text-neutral-800 hover:bg-gray-200 "
                  onClick={clearImage}
                >
                  ×
                </button>
              </div>
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-28 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            {!isLoading && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <GrGallery size={20} className="text-gray-600 hover:scale-105" />
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
              className="px-4 py-1 bg-gradient-to-r from-blue-400 to-indigo-400 hover:bg-gradient-to-r hover:from-indigo-400 hover:to-blue-400 hover:scale-105 text-black rounded-md font-semibold flex items-center space-x-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <Loader className="size-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isProcessingImage ? "Processing image..." : "Creating your post..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}