import { FiSend } from "react-icons/fi";
import { GrGallery } from "react-icons/gr";
import { useShareStore } from "../stores/ShareStore/useShareStore";

export default function Share() {
  const {
    content,
    imagePreview,
    error,
    isLoading,
    setContent,
    setSelectedFile,
    submitPost,
    clearForm,
  } = useShareStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      await setSelectedFile(file);
    }
  };

  const handleShare = async () => {
    try {
      await submitPost();
      clearForm();
    } catch (error) {
      // Error handling is already done in the store
    }
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
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {content.length}/200
          </div>
        </div>

        {imagePreview && (
          <div className="my-4 static">
            <div className="flex justify-end">
            <button
              className="bg-white rounded-full p-2 shadow-sm hover:bg-gray-200"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </button>
            </div>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-30 w-full object-cover rounded-lg"
            />
            
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <GrGallery size={20} className="text-gray-600" />
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>

          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-md font-semibold flex items-center space-x-2 hover:bg-yellow-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleShare}
            //disabled={isLoading || (!content.trim() && !imagePreview)}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </div>
            ) : (
              <>
                <FiSend className="inline-block" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}