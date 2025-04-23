import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Bell } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import FriendRequestCard from "./FriendRequestCard";
import { AnimatePresence, motion } from "framer-motion";

const FriendRequests = () => {
  const { requests, acceptRequest, rejectRequest, loading } = useFriendsStore();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-40 bg-gray-200 dark:bg-neutral-700" />
          <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-neutral-700 rounded-full" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-600"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-neutral-700" />
                <div>
                  <Skeleton className="h-5 w-28 mb-2 bg-gray-200 dark:bg-neutral-700" />
                  <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-neutral-700" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md bg-gray-200 dark:bg-neutral-700" />
                <Skeleton className="h-8 w-20 rounded-md bg-gray-200 dark:bg-neutral-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700"
          >
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
              No pending requests
            </h3>
            <p className="text-gray-500 mt-1">
              When someone sends you a friend request, it will show up here
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-4 md:grid-cols-2"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="popLayout">
              {requests.map((user) => (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <FriendRequestCard
                    user={user}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendRequests;