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

  if (loading) {
    return (
      <Card className="w-full shadow-sm border border-gray-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Friend Suggestions
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50" disabled>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>People you might know</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-neutral-700" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-36 mb-1 bg-gray-200 dark:bg-neutral-700" />
                  <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-neutral-700" />
                </div>
                <Skeleton className="h-9 w-16 rounded-md bg-gray-200 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="w-fit shadow-sm border border-gray-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Friend Suggestions
            </CardTitle>
            <Button 
              onClick={refreshSuggestions}
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>People you might know</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No more suggestions available at the moment</p>
            <Button onClick={refreshSuggestions} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm border border-gray-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Friend Suggestions
          </CardTitle>
          <Button 
            onClick={refreshSuggestions} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 transition-all hover:bg-gray-100 dark:hover:bg-neutral-800"
            title="Refresh suggestions"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>People you might know</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {suggestions.map((suggestion: SuggestionUser) => {
            const isProcessing = processingUsers.includes(suggestion._id);
            const isPending = suggestion.isPending;
            
            return (
              <div key={suggestion._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                <Link to={`/profile/${suggestion._id}`}>
                  <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-neutral-800">
                    <AvatarImage src={suggestion.profilePicture || "/avatar.jpeg" } alt={suggestion.name} />
                    <AvatarFallback className="bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200">{getInitials(suggestion.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${suggestion._id}`}>
                    <h4 className="font-medium text-sm hover:underline truncate">{suggestion.name}</h4>
                  </Link>
                  
                  {(suggestion.mutualFriends ?? 0) > 0 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {suggestion.mutualFriends} mutual friend{(suggestion.mutualFriends ?? 0) > 1 ? 's' : ''}
                    </p>
                  )}
                  
                  {suggestion.department && (
                    <p className="text-xs text-gray-500 truncate">{suggestion.department}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {isPending ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled
                      className="flex items-center gap-1 shadow-sm text-xs"
                    >
                      Sent
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRequest(suggestion._id)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 shadow-sm text-xs"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserPlus className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleIgnore(suggestion._id)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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