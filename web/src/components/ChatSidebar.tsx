import { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { IUser } from "@/lib/utils";

const ChatSidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unReadMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers, selectedUser]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = showOnlineOnly
    ? safeUsers.filter((user) => onlineUsers.includes(user._id))
    : safeUsers;

  const getUnreadCount = (userId: string) => {
    return unReadMessages.filter(message => message.sender === userId).length;
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full -translate-y-1 sm:translate-y-0 w-full md:w-60 lg:w-72 md:border-r bg-white dark:bg-neutral-900 border-gray-300 flex flex-col transition-all duration-200">
      <div className="border-b border-gray-300 lg:w-72 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium block">Contacts</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-gray-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full pb-3 flex-1">
        <AnimatePresence mode="wait">
          {filteredUsers.length > 0 ? (
            <motion.div
              key="user-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredUsers.map((user) => {
                const unreadCount = getUnreadCount(user._id);
                
                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      if (user._id) setSelectedUser(user as IUser);
                      else console.error("User ID is missing or invalid");
                    }}
                    className={`
                      w-full p-3 flex items-center gap-3
                      hover:bg-gray-700 transition-colors relative
                      ${
                        selectedUser?._id === user._id
                          ? "bg-gray-700 ring-1 ring-gray-300"
                          : ""
                      }
                    `}
                  >
                    <div className="relative mx-auto lg:mx-0 border border-gray-400 rounded-full p-[1px]">
                      <img
                        src={user.profilePicture || "/avatar.jpeg"}
                        alt={user.username}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      {onlineUsers.includes(user._id) && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                    <div className="block text-left min-w-0 flex-1">
                      <div className="font-medium truncate flex items-center justify-between">
                        <span>{user.username}</span>
                        {unreadCount > 0 && (
                          <span className="ml-2 hidden md:block md:relative absolute bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-5 text-center">
                            {"+" + unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                    
                    {/* Show unread count badge in mobile view */}
                    {unreadCount > 0 && (
                      <div className="absolute top-1 right-1 md:hidden">
                        <span className="bg-blue-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-4 text-center">
                          {"+" + unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="no-users"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center text-gray-500 py-4"
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