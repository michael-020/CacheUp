import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-gray-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full relative border border-gray-400 p-[2px]">
            <img 
              className="rounded-full w-full h-full object-cover" 
              src={selectedUser?.profilePicture || "/avatar.png"} 
              alt={selectedUser?.username} 
            />
          </div>

          <div>
            <h3 className="font-medium">{selectedUser?.username}</h3>
            <p className="text-xs text-gray-500">
              {selectedUser !== null && onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSelectedUser(null)}
          className="hover:bg-gray-200 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;