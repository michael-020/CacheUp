import { memo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useUserStatsStore } from '@/stores/StatsStore/useStatsStore';

export const DateNavigation = memo(() => {
  const { selectedDate, setSelectedDate, fetchStats } = useUserStatsStore();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousDay = async () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    await fetchStats(prevDay);
  };

  const goToNextDay = async () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay);
      await fetchStats(nextDay);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToPreviousDay}
        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (date) {
              setSelectedDate(date);
              fetchStats(date);
            }
          }}
          maxDate={new Date()}
          className="px-3 py-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-200 bg-transparent text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors"
          dateFormat="EEEE, MMMM d, yyyy"
          calendarClassName="dark:bg-neutral-800 dark:text-gray-200 dark:border-neutral-700"
        />
      </div>
      
      <button
        onClick={goToNextDay}
        disabled={isToday(selectedDate)}
        className={`p-2 rounded-full transition-colors ${
          isToday(selectedDate)
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-neutral-700'
        }`}
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
});

DateNavigation.displayName = 'DateNavigation';