import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { IUser } from "@/lib/utils";

interface FriendRequestCardProps {
  user: IUser;
  onAccept: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
}

const FriendRequestCard = ({ user, onAccept, onReject }: FriendRequestCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(user._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(user._id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user._id}`}>
          <Avatar className="h-14 w-14 border-2 border-purple-100 dark:border-purple-900">
            <AvatarImage src={user.profilePicture || ""} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${user._id}`} className="hover:underline">
            <h3 className="font-semibold">{user.name}</h3>
          </Link>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm mt-1">
            <span className="text-xs text-gray-500">
              {user.department || ""}
              {user.department && user.graduationYear ? " • " : ""}
              {user.graduationYear || ""}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm"
          variant="default" 
          className="rounded-full bg-blue-600 hover:bg-blue-700 px-3"
          onClick={handleAccept}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          <span>Accept</span>
        </Button>

        <Button 
          size="sm"
          variant="outline"
          className="rounded-full border-gray-300 px-3"
          onClick={handleReject}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></span>
          ) : (
            <X className="h-4 w-4 mr-1" />
          )}
          <span>Decline</span>
        </Button>
      </div>
    </div>
  );
};

export default FriendRequestCard;