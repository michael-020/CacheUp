import { AdminFeed } from '@/components/admin/AdminFeed';
import AdminLeftbar from '@/components/admin/AdminLeftbar';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore'

const AdminHome = () => {
  const { authAdmin } = useAdminStore()

  return (
      <div className="min-h-screen bg-red-300">
        <div className='fixed hidden md:block'>
            <AdminLeftbar />
        </div>
        <div className="flex w-screen justify-center "> 
          
          <div className=""> 
            <AdminFeed />
          </div>
        </div>
      </div>
    );
}

export default AdminHome