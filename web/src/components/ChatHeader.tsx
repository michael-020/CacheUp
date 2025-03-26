import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative border border-gray-400 p-[2px] ">
              <img className="rounded-full" src={selectedUser?.profilePicture || "/avatar.png"} alt={selectedUser?.username} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.username}</h3>
            <p className="text-xs text-base-content/50">
              {selectedUser !== null && onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;