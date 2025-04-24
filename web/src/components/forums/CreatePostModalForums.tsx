import { useState, useRef, useEffect } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, X } from "lucide-react";
import { createPortal } from "react-dom";

interface PostModalProps {
  threadMongo?: string;
  threadWeaviate?: string;
  postId?: string;
  weaviateId?: string;
  initialContent?: string;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  isEditingPost?: boolean
}

const PostModal = ({ 
  threadMongo = "", 
  threadWeaviate = "", 
  postId = "", 
  weaviateId = "", 
  initialContent = "", 
  isOpen, 
  onClose, 
  mode,
  isEditingPost
}: PostModalProps) => {
    const { createPost, editPost, isCreatingPost } = useForumStore();
    const [content, setContent] = useState(initialContent);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const isLoading = mode === 'create' ? isCreatingPost : isEditingPost;

    // Set initial content when editing
    useEffect(() => {
      if (mode === 'edit' && initialContent) {
        setContent(initialContent);
      }
    }, [initialContent, mode]);

    // Auto-resize the textarea with a max height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`; // Limit max height
        }
    }, [content]); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        if (mode === 'create') {
          await createPost(threadMongo, threadWeaviate, content);
        } else if (mode === 'edit') {
          await editPost(postId, weaviateId, content);
        }
        
        setContent("");
        onClose(); 
    };

    const getTitle = () => {
      return mode === 'create' ? 'Create a Post' : 'Edit Post';
    };

    const getButtonText = () => {
      if (mode === 'create') {
        return isCreatingPost ? "Posting..." : "Post";
      } else {
        return isEditingPost ? "Saving..." : "Save Changes";
      }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50">
            <div 
                ref={modalRef}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg mx-4"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {getTitle()}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading && (
                        <div className="absolute inset-0 bg-neutral-800/80 dark:bg-neutral-900/80 flex items-center justify-center rounded-lg">
                            <Loader className="animate-spin size-7" />
                        </div>
                    )}
                    
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        placeholder="Write something..."
                        className="w-full p-3 border dark:border-neutral-600 dark:bg-neutral-800 rounded-md resize-none overflow-y-auto max-h-[150px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 flex justify-end">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        {getButtonText()}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;