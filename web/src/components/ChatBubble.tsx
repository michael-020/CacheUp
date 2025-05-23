import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { formatMessageTime, IUser } from "../lib/utils";
import React, { useState } from "react";
import ImageModal from "./modals/ImageModal";

interface ChatBubbleProps {
  message: {
    _id: string;
    sender: string;
    content?: string;
    image?: string;
    createdAt: Date;
  };
  selectedUser?: IUser;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, selectedUser }) => {
  const { authUser } = useAuthStore();
  const isOwnMessage = message.sender === authUser?._id;
  const [modalOpen, setModalOpen] = useState(false);

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
                ? "dark:bg-neutral-600 bg-neutral-400 text-neutral-100 dark:text-gray-200 self-end" 
                : "bg-gray-200 text-gray-800 self-start"
            }
          `}
        >
          {message.image && (
            <>
              <img
                src={message.image}
                alt="Message attachment"
                className="max-w-[200px] rounded-md mb-2 cursor-pointer transition-transform "
                onClick={() => setModalOpen(true)}
              />
              {modalOpen && (
                <ImageModal
                  src={message.image}
                  alt="Message attachment"
                  onClose={() => setModalOpen(false)}
                />
              )}
            </>
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