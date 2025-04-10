import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Image, SendHorizonal, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "@/stores/chatStore/useChatStore";

const ChatInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        content: text.trim(),
        image: imagePreview as string,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className=" w-full px-4 pb-4 dark:bg-neutral-800">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-300
              flex items-center justify-center hover:bg-gray-400 transition-colors"
              type="button"
            >
              <X className="w-3 h-3 dark:text-black" />
            </button>
          </div>
        </div>
      )}
   
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 dark:text-gray-400 text-black">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-500 dark:border-gray-600"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex items-center justify-center size-10 rounded-full 
                     ${imagePreview ? "text-green-500" : "text-gray-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={40} className="border-1 text-neutral-400 dark:text-gray-400" strokeWidth={1} />
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim() && !imagePreview}
        >
          <SendHorizonal size={22} />
        </button>
      </form>
    </div>
  );
};
export default ChatInput;