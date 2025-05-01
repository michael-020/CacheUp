import { AdminFeed } from "@/components/admin/AdminFeed";
import AdminLeftbar from "@/components/admin/AdminLeftbar";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden dark:bg-neutral-950">
      <div className="fixed hidden md:block">
        <AdminLeftbar />
      </div>
      <div className="flex w-screen justify-center">
        <div className="ml-[1rem] min-w-[700px]">
          <div className="flex justify-between items-center mb-6 mt-20">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button 
              onClick={() => navigate('/admin/stats')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Statistics
            </Button>
            <Button 
              onClick={() => navigate('/admin/reported-content')}
              className="flex items-center gap-2"
              >
                View Reported Content Forums
              </Button>
          </div>
          <AdminFeed />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
