import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";

interface PageViewStat {
  userId: string;
  name: string;
  username: string;
  pageViews: Array<{
    page: string;
    timeSpent: number;
  }>;
}

export const PageViews = () => {
  const [pageViews, setPageViews] = useState<PageViewStat[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const fetchPageViews = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/admin/stats/page-views/${formattedDate}`);
      
      if (response.data.success) {
        setPageViews(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching page views:', error);
    }
  };

  useEffect(() => {
    fetchPageViews(selectedDate);
  }, [selectedDate]);

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
          <h1 className="text-2xl font-bold">Page Views</h1>
        </div>

        <div className="mt-24 space-y-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            {pageViews.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No page views recorded for this date
              </p>
            ) : (
              <div className="space-y-6">
                {pageViews.map((stat) => (
                  <div 
                    key={stat.userId}
                    className="p-4 border dark:border-neutral-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{stat.name}</h4>
                      <span className="text-sm text-gray-500">@{stat.username}</span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-medium mb-2">Page Views:</h5>
                      {stat.pageViews.map((view, index) => (
                        <div 
                          key={index}
                          className="flex justify-between text-sm text-gray-600 dark:text-gray-400 py-1 border-b dark:border-neutral-700 last:border-0"
                        >
                          <span>{view.page}</span>
                          <span>{Math.round(view.timeSpent)} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PageViews;