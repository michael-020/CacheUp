import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useForumStore } from "@/stores/ForumStore/useforumStore";
import { SearchBar } from "../forums/search-bar";


export const ThreadSkeleton = () => {
  const navigate = useNavigate()
  const { isWatched } = useForumStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20">
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-10">
      <SearchBar />
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700 "
            >
              <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="h-10 w-56 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
          </div>
          <div className="h-8 w-96 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
        </div>
        <div className="h-6 w-20 mx-auto rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
        <div className="flex gap-4 flex-wrap justify-center border-b pb-4">
          <Button
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-800 mt-3"
          >
            {isWatched ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 18a8 8 0 100-16 8 8 0 000 16zm-2.293-7.707l-1-1A1 1 0 118.707 8.293l1 1a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                </svg>
                Un-Subscribe
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-2 8a2 2 0 114 0 2 2 0 01-4 0z" />
                </svg>
                Subscribe
              </>
            )}
          </Button>
          <Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-3">
            + New Post
          </Button>
        </div>
        {/* Posts */}
        <div className="space-y-6 mt-4">
          {[1, 2].map((post) => (
            <div key={post} className="rounded-lg shadow border bg-white dark:bg-neutral-800 overflow-hidden">
              {/* Author Section */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                {post === 1 && (
                  <div className="h-6 w-24 rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-neutral-900 border-t">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};