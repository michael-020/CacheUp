import { useEffect, useState } from 'react';
import { useForumStore } from '@/stores/ForumStore/forumStore';
import { AlertCircle, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UnreportContentType } from '@/stores/ForumStore/types'

const ReportedContentPage = () => {
  const { reportedComments, reportedPosts, reportedThreads, fetchReportedContent, deleteThread, deleteComment, deletePost, unreportContent } = useForumStore();
  const [activeTab, setActiveTab] = useState('comments');

  const handleDelete = (type: string, id: string, weaviateId: string) => {
    switch (type) {
      case 'comment':
        deleteComment(id, weaviateId, true);
        break;
      case 'post':
        deletePost(id, weaviateId, true);
        break;
      case 'thread':
        deleteThread(id, weaviateId);
        break;
      default:
        break;
    }
  };

  const handleKeep = (type: UnreportContentType, id: string) => {
    unreportContent(type, id)
  }

  useEffect(()=> {
    fetchReportedContent()
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reported Content Management</h1>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'comments' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments ({reportedComments.length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({reportedPosts.length})
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'threads' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('threads')}
        >
          Threads ({reportedThreads.length})
        </button>
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {/* Comments section */}
        {activeTab === 'comments' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-yellow-500" size={20} />
              Reported Comments
            </h2>
            
            {reportedComments.length === 0 ? (
              <p className="text-gray-500 italic">No reported comments.</p>
            ) : (
              <div className="space-y-4">
                {reportedComments.map(comment => (
                  <div key={comment._id} className="border rounded-lg p-4 bg-white shadow-sm dark:bg-black">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">{comment.createdBy.username}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleKeep('comment', comment._id)}
                          className="flex items-center text-green-600 hover:bg-green-50 rounded-md px-2 py-1"
                        >
                          <Check size={16} className="mr-1" />
                          Keep
                        </button>
                        <button 
                          onClick={() => handleDelete('comment', comment._id, comment.weaviateId)}
                          className="flex items-center text-red-600 hover:bg-red-50 rounded-md px-2 py-1"
                        >
                          <X size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className='text-black dark:text-white'>{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts section */}
        {activeTab === 'posts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-yellow-500" size={20} />
              Reported Posts
            </h2>
            
            {reportedPosts.length === 0 ? (
              <p className="text-gray-500 italic">No reported posts.</p>
            ) : (
              <div className="space-y-4">
                {reportedPosts.map(post => (
                  <div key={post._id} className="border rounded-lg p-4 bg-white shadow-sm dark:bg-black">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/admin/forums/thread/${post.thread}/${post.pageNumber}?post=${post._id}`}>
                      <div>
                        <h3 className="font-medium text-lg">{post.content}</h3>
                        <span className="text-gray-500 text-sm">
                          Posted by {post.createdBy.username} · {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      </Link>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleKeep('post', post._id)}
                          className="flex items-center text-green-600 hover:bg-green-50 rounded-md px-2 py-1"
                        >
                          <Check size={16} className="mr-1" />
                          Keep
                        </button>
                        <button 
                          onClick={() => handleDelete('post', post._id, post.weaviateId)}
                          className="flex items-center text-red-600 hover:bg-red-50 rounded-md px-2 py-1"
                        >
                          <X size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Threads section */}
        {activeTab === 'threads' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-yellow-500" size={20} />
              Reported Threads
            </h2>
            
            {reportedThreads.length === 0 ? (
              <p className="text-gray-500 italic">No reported threads.</p>
            ) : (
              <div className="space-y-4">
                {reportedThreads.map(thread => (
                  <div key={thread._id} className="border rounded-lg p-4 bg-white shadow-sm dark:bg-black">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{thread.title}</h3>
                        <span className="text-gray-500 text-sm">
                          Created by {thread.createdBy.username} · {new Date(thread.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleKeep('thread', thread._id)}
                          className="flex items-center text-green-600 hover:bg-green-50 rounded-md px-2 py-1"
                        >
                          <Check size={16} className="mr-1" />
                          Keep
                        </button>
                        <button 
                          onClick={() => handleDelete('thread', thread._id, thread.weaviateId)}
                          className="flex items-center text-red-600 hover:bg-red-50 rounded-md px-2 py-1"
                        >
                          <X size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-700">
                      <p><strong>Description:</strong> {thread.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportedContentPage;