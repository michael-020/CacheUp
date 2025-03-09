import { FiSend } from "react-icons/fi";
import { GrGallery } from "react-icons/gr";
import { useShareStore } from "../stores/ShareStore";
import { usePostStore } from "../stores/postStore";

export default function Share() {
  const {
    content,
    imagePreview,
    error,
    setContent,
    setSelectedFile,
    validatePost,
    clearForm,
  } = useShareStore();

  const { createPost } = usePostStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleShare = () => {
    if (!validatePost()) return;

    createPost(content, imagePreview || undefined);
    clearForm();
  };

  return (
    <div className="w-[800px] mx-auto mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="border-b pb-4">
          <textarea
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {imagePreview && (
          <div className="my-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-60 w-full object-cover rounded-lg"
            />
          </div>
        )}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            {/* <GrGallery className="text-gray-500" size={20} /> */}
            <span className="text-sm text-gray-600">Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-md font-semibold flex items-center space-x-2 hover:bg-yellow-300 transition duration-300 disabled:opacity-50"
            onClick={handleShare}
            //disabled={!content && !imagePreview}
          >
            <FiSend />
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
