import { Comment } from '@/lib/utils'
import { useNavigate } from 'react-router-dom' 

const CommentCard = (comment: {
    _id: string;
  content: string;       
  user: {               
    _id: string;
    username: string;   
    profileImagePath?: string;
  };
  date: Date;      
}) => {

  const navigate = useNavigate();
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${comment.user._id}`);
  };


  return (
    <div>
        <div
            className="bg-white p-3 rounded-md border border-gray-100 group relative"
        >
            {/* Comment Header with User Info */}
            <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-xs text-gray-500">
                <img
                src={
                    comment.user.profileImagePath || "/avatar.jpeg"
                }
                className="w-5 h-5 rounded-full mr-2 cursor-pointer"
                alt={comment.user.username}
                onClick={handleProfileClick}
                />
                <span className="font-semibold text-gray-700 cursor-pointer"  onClick={handleProfileClick}>
                {comment.user.username}
                </span>
                <span className="mx-2">•</span>
                <span className="text-xs">
                {new Date(comment.date).toLocaleDateString()}
                </span>
            </div>
            </div>
            <div>
            {comment.content}
            </div>
        </div>
    </div>
  )
}

export default CommentCard