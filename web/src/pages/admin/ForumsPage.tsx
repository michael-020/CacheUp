import { ForumsList } from "@/components/forums/ForumsList"
import { SearchBar } from "@/components/forums/search-bar"

export  function ForumsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mt-8">Forums</h1>
      <SearchBar />
      <ForumsList />
    </div>
  )
}

