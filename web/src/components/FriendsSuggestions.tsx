import { useEffect, useState } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, RefreshCw, X, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuggestionUser } from "@/stores/FriendsStore/types";

const FriendSuggestions = () => {
  const { 
    suggestions, 
    fetchSuggestions, 
    sendRequest, 
    ignoreSuggestion,
    loading, 
    refreshSuggestions 
  } = useFriendsStore();
  const [processingUsers, setProcessingUsers] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRequest = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    
    try {
      await sendRequest(userId);
    } catch (err) {
      console.error("Error sending request:", err);
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleIgnore = (userId: string) => {
    ignoreSuggestion(userId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSuggestions();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure UI consistency
    }
  };

  const cardClasses = "shadow-sm border border-gray-200 dark:border-neutral-800";

  if (loading || isRefreshing) {
    return (
      <Card className={`${cardClasses} w-full lg:w-[250px] xl:w-[300px]`}>
        <CardHeader className="pb-2 px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              Friend Suggestions
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50" disabled>
              <RefreshCw className="h-3 w-3 animate-spin" />
            </Button>
          </div>
          <CardDescription className="text-xs">People you might know</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700" />
                <div className="flex-1 min-w-0 pr-1">
                  <Skeleton className="h-4 w-24 mb-1 bg-gray-200 dark:bg-neutral-700" />
                  <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-neutral-700" />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Skeleton className="h-7 w-9 rounded-md bg-gray-200 dark:bg-neutral-700" />
                  <Skeleton className="h-7 w-7 rounded-md bg-gray-200 dark:bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={`${cardClasses} w-full lg:w-[250px] xl:w-[300px]`}>
        <CardHeader className="pb-2 px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              Friend Suggestions
            </CardTitle>
            <Button 
              onClick={handleRefresh}
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription className="text-xs">People you might know</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-4">
          <div className="text-center py-4">
            <p className="text-gray-500 text-xs mb-3">No more suggestions available at the moment</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs h-8"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardClasses} w-full lg:w-[250px] xl:w-[300px]`}>
      <CardHeader className="pb-2 px-3 sm:px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4" />
            Friend Suggestions
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 transition-all hover:bg-gray-100 dark:hover:bg-neutral-800"
            title="Refresh suggestions"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-xs">People you might know</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
          {suggestions.map((suggestion: SuggestionUser) => {
            const isProcessing = processingUsers.includes(suggestion._id);
            const isPending = suggestion.isPending;
            
            return (
              <div key={suggestion._id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                <Link to={`/profile/${suggestion._id}`}>
                  <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-neutral-800">
                    <AvatarImage src={suggestion.profilePicture || "/avatar.jpeg" } alt={suggestion.name} />
                    <AvatarFallback className="bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 text-xs">{getInitials(suggestion.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="flex-1 min-w-0 pr-1">
                  <Link to={`/profile/${suggestion._id}`}>
                    <h4 className="font-medium text-xs hover:underline truncate">{suggestion.name}</h4>
                  </Link>
                  
                  {(suggestion.mutualFriends ?? 0) > 0 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {suggestion.mutualFriends} mutual{(suggestion.mutualFriends ?? 0) > 1 ? 's' : ''}
                      </span>
                    </p>
                  )}
                  
                  {/* {suggestion.department && (
                    <p className="text-xs text-gray-500 truncate">{suggestion.department}</p>
                  )} */}
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPending ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled
                      className="shadow-sm text-xs h-7 px-2"
                    >
                      Sent
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRequest(suggestion._id)}
                      disabled={isProcessing}
                      className="shadow-sm text-xs h-7 px-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          {/* <span className="ml-1 hidden xs:inline-block md:hidden lg:inline-block"></span> */}
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleIgnore(suggestion._id)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 h-7 w-7 p-0"
                    title="Ignore suggestion"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendSuggestions;