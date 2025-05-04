import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Bell, Send, LucideIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import FriendRequestCard from "./FriendRequestCard";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn, IUser } from "@/lib/utils";

const FriendRequests = () => {
  const { requests, sentRequests, acceptRequest, rejectRequest, cancelRequest, loading } = useFriendsStore();
  const [activeSection, setActiveSection] = useState<'received' | 'sent'>('received');

  if (loading) {
    return <RequestsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-neutral-800 mb-6">
        <button
          onClick={() => setActiveSection('received')}
          className={cn(
            "pb-2 px-4 transition-colors relative",
            activeSection === 'received' 
              ? "text-blue-600 font-medium" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <span>Received Requests</span>
            {requests.length > 0 && (
              <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                {requests.length}
              </span>
            )}
          </div>
          {activeSection === 'received' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
            />
          )}
        </button>

        <button
          onClick={() => setActiveSection('sent')}
          className={cn(
            "pb-2 px-4 transition-colors relative",
            activeSection === 'sent' 
              ? "text-blue-600 font-medium" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <span>Sent Requests</span>
          </div>
          {activeSection === 'sent' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'received' ? (
          <ReceivedRequests 
            requests={requests} 
            onAccept={acceptRequest} 
            onReject={rejectRequest} 
          />
        ) : (
          <SentRequests 
            requests={sentRequests} 
            onCancel={cancelRequest} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ReceivedRequests = ({ 
  requests,
  onAccept,
  onReject 
}: {
  requests: IUser[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) => {
  if (requests.length === 0) {
    return <EmptyState icon={Bell} message="No pending requests" />;
  }

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {requests.map((user: IUser) => (
        <FriendRequestCard
          key={user._id}
          user={user}
          onAccept={() => onAccept(user._id)}
          onReject={() => onReject(user._id)}
        />
      ))}
    </motion.div>
  );
};

const SentRequests = ({ 
  requests,
  onCancel 
}: {
  requests: IUser[];
  onCancel: (id: string) => Promise<void>;
}) => {
  if (requests.length === 0) {
    return <EmptyState icon={Send} message="No sent requests" />;
  }

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {requests.map((user) => (
        <div 
          key={user._id}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.profilePicture || "/avatar.jpeg"}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={() => onCancel(user._id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium border dark:border-neutral-700 dark:hover:bg-neutral-700 hover:bg-gray-100 px-3 py-1 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: LucideIcon, message: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700"
  >
    <Icon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
      {message}
    </h3>
  </motion.div>
);

const RequestsSkeleton = () => (
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

export default FriendRequests;