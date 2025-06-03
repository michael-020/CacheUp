import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full h-full dark:bg-neutral-800 flex flex-1 flex-col items-center justify-center p-16 bg-gray-50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center
             justify-center animate-bounce"
            >
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold">Welcome to CacheUpp!</h2>
        <p className="text-gray-600">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;