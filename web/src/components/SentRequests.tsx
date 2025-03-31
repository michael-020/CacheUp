import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XCircle, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SentRequests = () => {
  const { sentRequests, loading,cancelRequest } = useFriendsStore();

 

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Send className="h-5 w-5" />
        Sent Requests ({sentRequests.length})
      </h2>

      {sentRequests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg">
          <Send className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No pending sent requests</h3>
          <p className="text-gray-500 mt-1">When you send a friend request, it will appear here until accepted</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sentRequests.map((user) => (
            <div 
              key={user._id} 
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-100 dark:border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <Link to={`/profile/${user._id}`}>
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.profilePicture || ""} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${user._id}`} className="hover:underline">
                    <h3 className="font-semibold">{user.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>{user.department || ""}</span>
                    {user.department && user.graduationYear && <span>•</span>}
                    <span>{user.graduationYear || ""}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Request sent 2d ago</span>
                  </div>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="rounded-full border-gray-300 text-gray-600"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    <span>Cancel</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Friend Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your friend request to {user.name}? 
                      They won't be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => cancelRequest(user._id)}
                        className="bg-red-600 hover:bg-red-700"
                        >
                        Cancel Request
                        </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentRequests;