import { useEffect, useState } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Search, Users, Bell, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FriendsList from "@/components/FriendsList";
import FriendRequests from "@/components/FriendRequests";
import UsersList from "@/components/UsersList";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";
import { Helmet } from "react-helmet-async";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    fetchFriends, 
    fetchRequests,
    fetchSentRequests,
    friends,
    requests,
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
        return <FriendRequests />;
      default:
        return <FriendsList searchTerm={searchTerm} />;
    }
  };

  return (
    <motion.div 
      className="dark:bg-neutral-950 h-full min-h-[calc(100vh-1px)]"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"  
    >
      <Helmet>
        <title>Friends | CahceUp</title>
      </Helmet>
      <div className="max-w-5xl mx-auto p-6 translate-y-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Search Bar - Now takes the full width since title is removed */}
          <div className="relative w-full md:w-96 ml-auto">
            <div className="absolute right-3 top-2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab Navigation - Improved spacing */}
        <div className="grid grid-cols-3 gap-2 mb-8 border-b border-gray-200 dark:border-neutral-800 sm:flex sm:gap-0">
        {[
            { id: 'friends', label: 'My Friends', icon: <Users className="h-5 w-5" />, count: friends.length || 0},
            { id: 'requests', label: 'Friend Requests', icon: <Bell className="h-5 w-5" />, count: requests.length || 0},
            { id: 'users', label: 'Find Users', icon: <UserPlus className="h-5 w-5" />, count: 0 }
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

        {/* Active Tab Content */}
        <div className="min-h-[400px]">
          {renderActiveTab()}
        </div>
      </div>
    </motion.div>
  );
};

export default FriendsPage;