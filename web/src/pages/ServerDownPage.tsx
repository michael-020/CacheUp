import { WifiOff} from 'lucide-react';

export function ServerDownPage() {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 dark:from-black dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 text-center border border-red-100 dark:border-blue-800">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Server Unavailable
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Our servers are currently experiencing issues. We're working to restore service as quickly as possible.
          </p>
          

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Server Status: Offline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
