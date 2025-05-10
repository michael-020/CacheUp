import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const naviagate = useNavigate()
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    // await searchForums(searchQuery)
    naviagate(`/forums/search?q=${encodeURIComponent(searchQuery)}`)
    console.log("Searching for:", searchQuery)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground " />
        <Input
          type="text"
          placeholder="Search forums and threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 dark:bg-neutral-900"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded transition-colors duration-200"
      >
        Search
      </button>
    </form>
  )
}

