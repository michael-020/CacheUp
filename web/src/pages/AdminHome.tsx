import { AdminFeed } from '@/components/feeds/AdminFeed';
import { Feed } from '@/components/feeds/Feed';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore'

const AdminHome = () => {
  const { authAdmin } = useAdminStore()

  return (
      <div className="min-h-screen bg-red-300">
        <div className="flex"> 
          <div className="lg:ml-[21rem]"> 
            <AdminFeed />
          </div>
        </div>
      </div>
    );
}

export default AdminHome