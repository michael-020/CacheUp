const MessageSkeleton = () => {
  const skeletonMessages = Array(4).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
      {skeletonMessages.map((_, idx) => (
        <div 
          key={idx} 
          className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"} items-center gap-2`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 bg-gray-300 animate-pulse rounded" />
            <div className="w-[100px] sm:w-[200px] h-10 sm:h-16 bg-gray-300 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;