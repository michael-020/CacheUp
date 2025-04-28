import { UserStats } from "@/components/UserStats";
import { Statistics as TimeTrackingStats } from "@/components/admin/Statistics";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Statistics = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-neutral-900"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4 translate-y-20">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">User Statistics</h1>
        </div>

        <div className="mt-24 space-y-8">
          {/* Time Tracking Statistics */}
          <TimeTrackingStats />
          
          {/* User Login/Logout Statistics */}
          <UserStats />
        </div>
      </div>
    </motion.div>
  );
};

export default Statistics;