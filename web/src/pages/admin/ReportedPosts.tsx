import AdminLeftbar from "@/components/admin/AdminLeftbar"
import ReportedPostFeed from "@/components/ReportedPostFeed"
import { useAdminStore } from "@/stores/AdminStore/useAdminStore"
import { useEffect } from "react"

const ReportedPosts = () => {
  const { reportedPosts, getReportedPosts } = useAdminStore()

  useEffect(() => {
    getReportedPosts()
  },[getReportedPosts])

  return <div className="min-h-screen">
    <div className="fixed hidden md:block ">
      <AdminLeftbar />
    </div>
    <div className="mt-16">
    <div className="relative top-12">
        {reportedPosts && reportedPosts.length > 0 ? (
          reportedPosts.map((post) => (
            <ReportedPostFeed  post={post} />
          ))
        ) : (
          <p className=" flex items-center justify-center">No Reported Posts...</p> 
        )}
      </div>
    </div>
      
    </div>
  
}

export default ReportedPosts