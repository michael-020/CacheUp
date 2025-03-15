import { FiSend } from "react-icons/fi";
import { GrGallery } from "react-icons/gr";
import { ChangeEvent, FormEvent, useState } from "react";
import { usePostStore } from "@/stores/PostStore/usePostStore";

export default function Share() {
  const { createPost, isUploadingPost } = usePostStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result as string;
      setImagePreview(base64Image);
      setImage(base64Image);
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    
    try {
      await createPost({ text, image });
      // Clear form after successful post
      setText("");
      setImage("");
      setImagePreview("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const clearImage = () => {
    setImagePreview("");
    setImage("");
  };

  return (
    <div className="w-full md:w-[800px] mx-auto mb-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
        <div className="border-b pb-4">
          <textarea
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
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
          <label className="flex items-center space-x-2 cursor-pointer">
            <GrGallery size={20} className="text-gray-600" />
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-yellow-400 text-black rounded-md font-semibold flex items-center space-x-2 hover:bg-yellow-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploadingPost}
          >
            {isUploadingPost ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Posting...</span>
              </div>
            ) : (
              <>
                <FiSend className="inline-block" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}