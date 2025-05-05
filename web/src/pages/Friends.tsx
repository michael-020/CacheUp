import { useEffect, useState } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Users, Bell, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import FriendsList from "@/components/FriendsList";
import FriendRequests from "@/components/FriendRequests";
import UsersList from "@/components/UsersList";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import SignInNavigation from "@/components/SignInNavigation";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const { authUser } = useAuthStore();
  const { 
    fetchFriends, 
    fetchRequests,
    fetchSentRequests,
    friends,
    requests
  } = useFriendsStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchFriends(),
          fetchRequests(),
          fetchSentRequests()
        ]);
      } catch (error) {
        console.error("Error loading friend data:", error);
      }
    };
    loadData();
  }, [fetchFriends, fetchRequests, fetchSentRequests]);

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'users':
        return <UsersList searchTerm={searchTerm} />;        
      case 'friends':
        return <FriendsList searchTerm={searchTerm} />;
      case 'requests':
        return <FriendRequests searchTerm={searchTerm} />;
      default:
        return <UsersList searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden pb-24 dark:bg-neutral-950">
      {authUser ? (
        <motion.div className="h-full" variants={routeVariants}
        initial="initial"
        animate="final"
        exit="exit">
          {/* Fixed Header Section */}
          <div className="translate-y-28 bg-gray-100 dark:bg-neutral-950 z-10">
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 dark:border-neutral-800 sm:flex sm:gap-0">
                {[
                  { id: 'users', label: 'Find Users', icon: <UserPlus className="h-5 w-5" />, count: 0 },
                  { id: 'friends', label: 'My Friends', icon: <Users className="h-5 w-5" />, count: friends.length || 0},
                  { 
                    id: 'requests', 
                    label: 'Requests', 
                    icon: <Bell className="h-5 w-5" />, 
                    count: requests.length || 0
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 sm:flex-none text-center pb-4 px-4 flex items-center justify-center gap-2 border-b-2 border-transparent transition-colors",
                      activeTab === tab.id ? "border-blue-500 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                    )}              
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id !== "friends" && tab.count > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-2.5 py-0.5 text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full my-4">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg placeholder:text-neutral-300 dark:placeholder:text-neutral-500 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <div className="absolute left-3 top-2.5 text-neutral-300 dark:text-neutral-500">
                  <Search />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="relative max-w-5xl mx-auto px-6">
            <div 
              className={`absolute inset-x-0 top-32 bottom-0 overflow-y-auto custom-scrollbar ${activeTab === "users" ? "px-5" : ""}`}
              style={{ height: 'calc(100vh - 17rem)' }}
            >
              {renderActiveTab()}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="translate-y-[50vh]">
          <SignInNavigation />
        </div>
      )}
    </div>
  );
};

export default FriendsPage;