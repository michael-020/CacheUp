import { useEffect } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";

const UserList = () => {
  const {
    userList: users,
    isFetchingUsers: loading,
    userError: error,
    fetchUsers
  } = useAdminStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main user list grid */}
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 mt-20 flex justify-center">All Users</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="relative h-[420px] w-72 cursor-pointer -mt-10 top-12"
            >
              <ProfileCard 
                isAdmin={true}
                userInfo={user} 
                isOwnProfile={false}
                className="relative w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;