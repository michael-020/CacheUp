import { useState, useRef, useEffect } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Modal from "@/components/ui/Modal";
import { Loader } from "lucide-react";

const CreatePostModal = ({ threadMongo, threadWeaviate, isOpen, onClose }: { threadMongo: string; threadWeaviate: string; isOpen: boolean; onClose: () => void }) => {
    const { createPost, isCreatingPost } = useForumStore();
    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize the textarea with a max height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`; // Limit max height
        }
    }, [content]); 

    const handleSubmit = async () => {
        if (!content.trim()) return;

        await createPost(threadMongo, threadWeaviate, content);
        setContent("");
        onClose(); 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create a Post">
            {isCreatingPost && <div className="dark:bg-neutral-800/80 bg-neutral-400/70 rounded-lg fixed inset-0">
                <div className="flex h-full items-center justify-center">
                    <Loader className="animate-spin size-7" />
                </div>    
            </div>}
            <div className="p-4">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Write something..."
                    className="w-full p-3 border dark:bg-neutral-800 rounded-md resize-none overflow-y-auto max-h-[150px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSubmit} disabled={isCreatingPost} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        {isCreatingPost ? "Posting..." : "Post"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreatePostModal;
