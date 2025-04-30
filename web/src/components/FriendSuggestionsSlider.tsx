import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { UserPlus, RefreshCw, Check, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SuggestionUser } from "@/stores/FriendsStore/types";

export const FriendSuggestionsSlider = () => {
  const { suggestions, sendRequest, ignoreSuggestion } = useFriendsStore();
  const [processingUsers, setProcessingUsers] = useState<string[]>([]);
  const [localPendingStatus, setLocalPendingStatus] = useState<Record<string, boolean>>({});

  const handleRequest = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    try {
      await sendRequest(userId);
      setLocalPendingStatus(prev => ({
        ...prev,
        [userId]: true
      }));
    } catch (err) {
      console.error("Error sending request:", err);
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="xl:max-w-[700px] md:max-w-[550px] sm:max-w-[500px] mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4 mb-4">
      <div className="flex flex-col justify-between mb-3">
        <h3 className="text-base font-medium">Friend Suggestions</h3>
        <h3 className="text-sm text-black/50 dark:text-white/50 font-medium">People You Might Know</h3>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {suggestions.map((suggestion: SuggestionUser) => {
          const isProcessing = processingUsers.includes(suggestion._id);
          const hasPendingRequest = suggestion.hasPendingRequest || localPendingStatus[suggestion._id];
          
          return (
            <div 
              key={suggestion._id} 
              className="w-[150px] flex flex-col items-center"
            >
              <Link to={`/profile/${suggestion._id}`}>
                <div className="relative w-[120px] h-[120px] rounded-lg border-2 border-gray-200 dark:border-neutral-700 overflow-hidden">
                  <img 
                    src={suggestion.profilePicture || "/avatar.jpeg"} 
                    alt={suggestion.name}
                    className="w-full h-full object-cover rounded-lg z-20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200 dark:bg-neutral-700 text-2xl font-medium text-gray-600 dark:text-gray-400';
                        fallback.textContent = suggestion.name.split(" ").map(n => n[0]).join("").toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  <button 
                    className="absolute z-40 top-0 right-0 h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent Link navigation
                      ignoreSuggestion(suggestion._id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Link>

              <div className="mt-2 text-center w-full">
                <Link to={`/profile/${suggestion._id}`}>
                  <h4 className="font-medium text-sm truncate hover:underline">
                    {suggestion.name}
                  </h4>
                </Link>
                {/* todo: mutual friends */}
                <p className="text-xs text-gray-500 mt-1">
                  {suggestion.username}
                </p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  {hasPendingRequest ? (
                    <button 
                      className="h-8 w-8 flex items-center justify-center rounded-md disabled:opacity-50"
                      disabled
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </button>
                  ) : (
                    <>
                      <button
                        className=" py-2 w-full flex items-center justify-center rounded-md dark:bg-neutral-700 bg-gray-100 hover:bg-gray-200 dark:hover:bg-neutral-600 disabled:opacity-50 transition-colors"
                        onClick={() => handleRequest(suggestion._id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex gap-3 justify-center items-center">
                                <UserPlus className="h-4 w-4" />
                                <p className="text-sm">Add</p>
                            </div>
                        )}
                      </button>
                      
                      
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};