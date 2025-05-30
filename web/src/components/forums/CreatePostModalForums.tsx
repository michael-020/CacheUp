import { useState, useRef, useEffect } from "react";
import { useForumStore } from "@/stores/ForumStore/useforumStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PostSchema } from "@/stores/ForumStore/types";

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
    const navigate = useNavigate()

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
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
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
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        try {
            if (mode === 'create') {
                const post: PostSchema = await createPost(threadMongo, threadWeaviate, content);
                setContent("");
                onClose();
                navigate(`/forums/thread/${threadMongo}/${post.pageNumber}?post=${post._id}`)
            } else if (mode === 'edit') {
                await editPost(postId, weaviateId, content);
                setContent("");
                onClose();
            }
            
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80" />
            
            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div 
                        ref={modalRef}
                        className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg mx-4"
                    >
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-50">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                            <h2 className="text-xl font-semibold dark:text-white">
                                {mode === 'create' ? 'Create a Post' : 'Edit Post'}
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
                            <Textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={3}
                                placeholder="Write something..."
                                className="w-full p-3 border dark:border-neutral-600 dark:bg-neutral-800 rounded-md resize-none overflow-y-auto max-h-[150px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 flex justify-end gap-4 border-t dark:border-neutral-700">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-3 py-1 rounded-md border dark:border-neutral-400 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        {mode === 'create' ? "Posting" : "Saving"}
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </>
                                ) : (
                                    mode === 'create' ? "Post" : "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;