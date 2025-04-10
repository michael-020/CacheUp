import { axiosInstance } from "@/lib/axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"


const AdminLeftbar = () => {
  const [totalUsers, setTotalUsers] = useState([])  
  const [reportedPosts, setReportedPosts] = useState(0)

  const getUsers = async () => {
    const res = await axiosInstance.get("/admin/view-users")
    setTotalUsers(res.data)
  }

  const getReportedPosts = async () => {
    const res = await axiosInstance.get("/admin/report")
    setReportedPosts( res.data.length)
  }

  useEffect(() => {
    getUsers()
    getReportedPosts()
  }, [])

  return (
    <div className="mt-24 w-60 h-72 bg-gray-50 translate-x-12 rounded-xl -z-50">
        <div className="flex flex-col w-full h-full ">
            <div className="h-2/4 w-full bg-neutral-700 relative rounded-t-md">
                <img src="/avatar.jpeg" className="size-20 rounded-md absolute top-16 left-1/2 -translate-x-1/2" />
            </div>
            <div className="w-full h-3/4 dark:bg-gray-700 rounded-b-md ">
                <div className="flex justify-center mt-8 text-xl font-bold">
                    Admin
                </div>
                <div className="mt-2 flex flex-col gap-2 items-start px-4">
                    <button>
                        <Link to="/admin/user-list">
                            Total Users: {totalUsers.length}
                        </Link>
                    </button>
                    <button>
                        <Link to="/admin/reported-posts">
                            Reported posts: {reportedPosts}
                        </Link>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AdminLeftbar