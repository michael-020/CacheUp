import { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { IUser } from "@/lib/utils";

const ChatSidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 lg:w-72 w-20 p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* User List Animation */}
      <div className="overflow-y-auto w-full py-3 flex-1">
        <AnimatePresence mode="wait">
          {/* Display User List if Users are Available */}
          {filteredUsers.length > 0 ? (
            <motion.div
              key="user-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    if (user._id) setSelectedUser(user as IUser);
                    else console.error("User ID is missing or invalid");
                  }}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300 transition-colors 
                    ${
                      selectedUser?._id === user._id
                        ? "bg-base-300 ring-1 ring-base-300"
                        : ""
                    }
                  `}
                >
                  <div className="relative mx-auto lg:mx-0 border border-gray-400 rounded-full p-[1px]">
                    <img
                      src={user.profilePicture || "/avatar.png"}
                      alt={user.username}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full"
                      />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.username}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (

            <motion.div
              key="no-users"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center text-zinc-500 py-4"
            >
              No online users
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default ChatSidebar;