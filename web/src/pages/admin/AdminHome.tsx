import { AdminFeed } from '@/components/admin/AdminFeed';
import AdminLeftbar from '@/components/admin/AdminLeftbar';

const AdminHome = () => {
   
  return (
      <div className="min-h-screen ">
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