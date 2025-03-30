import React from "react";
import { Link } from "react-router-dom";
import { AdminFeed } from "@/components/admin/AdminFeed";
import AdminLeftbar from "@/components/admin/AdminLeftbar";

const AdminHome = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed hidden md:block">
        <AdminLeftbar />
      </div>
      <div className="flex w-screen justify-center">
        <div className="ml-[1rem] min-w-[700px]">
          <AdminFeed />
        </div>
        
        {/* Right side link */}
        <div className="fixed right-6 top-6">
          <Link 
            to="/admin/home/forums"
            className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline mt-20"
          >
            Create Forums +
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;