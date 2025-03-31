import { useEffect } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, UserMinus, MoreHorizontal, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

const FriendsList = ({ searchTerm = "" }) => {
  const { 
    friends, 
    loading, 
    removeFriend, 
    fetchMutualFriends,
    mutualFriends,
    fetchFriends
  } = useFriendsStore();
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRemove = async (userId) => {
    await removeFriend(userId);
  };

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort friends alphabetically by name
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    friends.forEach(friend => {
      if (friend._id) {
        fetchMutualFriends(friend._id);
      }
    });
  }, [friends, fetchMutualFriends]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          My Friends
        </h2>
        <Badge variant="outline" className="px-3 py-1 text-sm flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
          <Users className="h-4 w-4" />
          {friends.length} Friends
        </Badge>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No friends yet</h3>
          <p className="text-gray-500 mt-1">Start connecting with others to build your network</p>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No matches found</h3>
          <p className="text-gray-500 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sortedFriends.map((friend) => (
            <div 
              key={friend._id} 
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <Link to={`/profile/${friend._id}`}>
                  <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-600">
                    <AvatarImage src={friend.profilePicture || ""} alt={friend.name} />
                    <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${friend._id}`} className="hover:underline">
                    <h3 className="font-semibold">{friend.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {mutualFriends[friend._id] > 0 && (
                      <span className="text-xs text-blue-600">{mutualFriends[friend._id]} mutual</span>
                    )}
                    {friend.department && (
                      <span className="max-w-[120px] truncate text-xs">{friend.department}</span>
                    )}
                    {friend.department && friend.graduationYear && <span className="text-xs">•</span>}
                    {friend.graduationYear && <span className="text-xs">{friend.graduationYear}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  asChild
                >
                  <Link to={`/message/${friend._id}`}>
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to={`/profile/${friend._id}`}>
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                      onClick={() => handleRemove(friend._id)}
                    >
                      <UserMinus className="h-4 w-4" /> 
                      Remove Friend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;