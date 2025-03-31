import { useEffect, useState } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { IUser } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface UserSearchProps {
  searchQuery?: string;
}

const UserSearch = ({ searchQuery = "" }: UserSearchProps) => {
  const { sendRequest, sentRequests } = useFriendsStore();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isRequestSent = (userId: string) => {
    return sentRequests.some(request => request._id === userId);
  };

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const query = searchQuery ? `?query=${searchQuery}` : "";
        const res = await axiosInstance.get(`/friends/search${query}`);
        setUsers(res.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          People You May Know
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="w-full bg-gray-50 dark:bg-neutral-900 border-dashed p-6 text-center rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No users found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? `No results found for "${searchQuery}"` : "Try adjusting your search criteria"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-100 dark:border-neutral-700 hover:shadow-md transition-shadow"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture || ""} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>

              <h3 className="font-semibold text-lg mt-2">{user.name}</h3>
              <p className="text-sm text-gray-500">@{user.username}</p>
              
              {user.department && (
                <p className="text-xs text-gray-500 mt-1">{user.department} • {user.graduationYear || ''}</p>
              )}

              <div className="mt-3">
                {user.isFriend ? (
                  <Button variant="outline" size="sm" disabled>
                    Friends
                  </Button>
                ) : isRequestSent(user._id) ? (
                  <Button variant="outline" size="sm" disabled>
                    Request Sent
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => sendRequest(user._id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Friend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;