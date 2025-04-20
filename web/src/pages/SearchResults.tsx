import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom" // or next/router if using Next.js
import { useForumStore } from "@/stores/ForumStore/forumStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, MessageSquare, Folder, FileText, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/forums/search-bar"
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation"
import { SearchResultItem } from "@/stores/ForumStore/types"

export function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchForums, searchResult, loading, error } = useForumStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Parse query parameter when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  // Function to perform the search
  const performSearch = async (query: string) => {
    try {
      await searchForums(query);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleItemClick = (item: SearchResultItem) => {
    switch (item.type) {
      case 'Forum':
        navigate(`/forums/${item.data._id}`);
        break;
      case 'Thread':
        navigate(`/forums/thread/${item.data._id}`);
        break;
      case 'Post':
        // Use correct format for post URL to ensure scrolling works
        navigate(`/forums/thread/${item.data.thread}?post/${item.data._id}`);
        break;
      case 'Comment':
        // Use correct format for comment's parent post URL
        navigate(`/forums/thread/${item.data.thread}?post/${item.data.post}`);
        break;
    }
  };

  // Function to get the right icon for each result type
  const getIcon = (type: string) => {
    switch (type) {
      case 'Forum':
        return <Folder className="h-5 w-5 text-blue-500" />;
      case 'Thread':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'Post':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'Comment':
        return <MessageCircle className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  // Function to format dates
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string) => {
    if (!text) return "";
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  // Function to get a display title for each result type
  const getDisplayTitle = (item: SearchResultItem) => {
    switch (item.type) {
      case 'Forum':
        return item.data.title;
      case 'Thread':
        return item.data.title;
      case 'Post':
        return `Post in thread`;
      case 'Comment':
        return `Comment on post`;
      default:
        return 'Unknown item';
    }
  };

  // Render search results
  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      );
    }

    // Ensure searchResult has the expected data
    const results = searchResult?.searchResults as SearchResultItem[];

    if (!results || results.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          No results found. Try a different search term.
        </div>
      );
    }

    return (<div>
      <div className="space-y-4">
        {results.map((item, index) => (
          <Card 
            key={`${item.type}-${item.data._id || index}`} 
            className="dark:hover:bg-neutral-800 hover:bg-accent/50 dark:bg-neutral-900 transition-colors cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <CardTitle className="text-lg">
                  {getDisplayTitle(item)}
                </CardTitle>
              </div>
              <Badge>{item.type}</Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {item.type === 'Post' || item.type === 'Comment' ? (
                <div className="line-clamp-2">{truncateText(item.data.content as string)}</div>
              ) : (
                item.data.description && <CardDescription>{truncateText(item.data.description)}</CardDescription>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {formatDate(item.data.createdAt)} • Match confidence: {(item.certainty * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="dark:bg-neutral-950 mx-auto p-10"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >      
      <div className="md:px-24">
        <h1 className="text-2xl font-bold mb-4 pt-10">
          Search Results {searchQuery ? `for "${searchQuery}"` : ""}
        </h1>
        <SearchBar />
        {renderResults()}
      </div>
    </motion.div>
  );
}