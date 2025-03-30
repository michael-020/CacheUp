import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { formatMessageTime } from "../lib/utils";

interface ChatBubbleProps {
  message: {
    _id: string;
    sender: string;
    content?: string;
    image?: string;
    createdAt: Date;
  };
  selectedUser?: any;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, selectedUser }) => {
  const { authUser } = useAuthStore();

  const isOwnMessage = message.sender === authUser?._id;

  return (
    <div 
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } items-end gap-2 mb-4`}
    >
      {!isOwnMessage && (
        <img
          src={selectedUser?.profilePicture || "/avatar.jpeg"}
          alt="Sender profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      <div className="flex flex-col max-w-[70%]">
        <div 
          className={`
            px-3 py-2 rounded-lg 
            ${
              isOwnMessage 
                ? "bg-blue-500 text-white self-end" 
                : "bg-gray-200 text-gray-800 self-start"
            }
          `}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Message attachment"
              className="max-w-[200px] rounded-md mb-2"
            />
          )}
          {message.content && <p>{message.content}</p>}
        </div>
        <span 
          className={`
            text-xs text-gray-500 mt-1 
            ${isOwnMessage ? "text-right" : "text-left"}
          `}
        >
          {formatMessageTime(message.createdAt)}
        </span>
      </div>

      {isOwnMessage && (
        <img
          src={authUser?.profilePicture || "/avatar.jpeg"}
          alt="Your profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
    </div>
  );
};

export default ChatBubble;