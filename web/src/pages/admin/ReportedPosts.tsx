import AdminLeftbar from "@/components/admin/AdminLeftbar"
import ReportedPostFeed from "@/components/ReportedPostFeed"
import { axiosInstance } from "@/lib/axios"
import { Post } from "@/lib/utils"
import { useAdminStore } from "@/stores/AdminStore/useAdminStore"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const ReportedPosts = () => {
  const [reportedPosts, setReportedPosts] = useState<Post[]>()
  const {isDeletingPost} = useAdminStore()
  useEffect(() => {
    const fetchReportedPosts = async() => {
      try {
        const res = await axiosInstance.get('/admin/report')
        setReportedPosts(res.data)
      } catch (error) {
        console.error("Error fetching posts:", error)
        toast.error(error as string)
      }
    }
    fetchReportedPosts()
  }, [isDeletingPost]) 
  return <div className="min-h-screen">
    <div className="fixed hidden md:block ">
      <AdminLeftbar />
    </div>
    <div className="mt-20">
    <div>
        {reportedPosts && reportedPosts.length > 0 ? (
          reportedPosts.map((post) => (
            <ReportedPostFeed key={post._id} post={post} />
          ))
        ) : (
          <p>Loading posts...</p> 
        )}
      </div>
    </div>
      
    </div>
  
}

export default ReportedPosts