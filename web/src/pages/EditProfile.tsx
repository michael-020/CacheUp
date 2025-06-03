import { z } from "zod";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Loader2} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";
import { Textarea } from "@/components/ui/textarea";

export const EditProfile = () => {
    const navigate = useNavigate();
    const updateSchema = z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        profilePicture: z.string().optional(),
        bio: z.string().optional(),
    }).strict({ message: "Extra fields not allowed" });

    type FormFields = z.infer<typeof updateSchema>;
    const { isEditing, editProfile, authUser } = useAuthStore();
    const [text, setText] = useState(authUser?.bio || "");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormFields>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            name: authUser?.name || "",
            username: authUser?.username || "",
            bio: authUser?.bio || "",
            profilePicture: authUser?.profilePicture || ""
        }
    });

    useEffect(() => {
        if (authUser) {
            reset({
                name: authUser.name || "",
                username: authUser.username || "",
                bio: authUser.bio || "",
                profilePicture: authUser.profilePicture || "",
            });
            
            if (authUser.profilePicture) {
                setImagePreview(authUser.profilePicture);
            }
        }
    }, [authUser, reset]);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await convertToBase64(file);
                const currentValues = authUser ? {
                    name: authUser.name || "",
                    username: authUser.username || "",
                    bio: authUser.bio || ""
                } : {};
                
                reset({ ...currentValues, profilePicture: base64 });
                setImagePreview(base64);
            } catch (error) {
                toast.error("Failed to process image.");
                console.error(error)
            }
        }
    };

    const onSubmit: SubmitHandler<FormFields> = (data) => {
        const { name, username, bio, profilePicture } = data;

        const sanitizedData = {
            name,
            username,
            bio,
            profilePicture: profilePicture ?? undefined,  
        };

        editProfile(sanitizedData);
    };

    const handleNavigateBack = () => {
        navigate(-1);
    };

    const containerStyle = {
        transition: 'opacity 0.3s ease-out',
    };

    return (
        <motion.div 
            className="max-w-2xl mx-auto px-4 pb-40 md:pb-36 lg:pb-0 sm:px-6 lg:px-8" 
            style={containerStyle}
            variants={routeVariants}
            initial="initial"
            animate="final"
            exit="exit"
        >
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden translate-y-20 md:translate-y-20 lg:translate-y-28">
                {/* Header */}
                <div className="bg-blue-600 py-3 px-4">
                    <div className="flex items-center">
                        <button 
                            onClick={handleNavigateBack}
                            className="text-white hover:text-blue-100 transition-colors mr-3"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-white">Edit Profile</h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5">
                    {/* Profile Picture */}
                    <div className="mb-6 text-center">
                        <div className="relative inline-block w-20 h-20 mb-3">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                <img 
                                    src={imagePreview || authUser?.profilePicture || '/avatar.jpeg'} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label 
                                htmlFor="profilePicture" 
                                className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                            >
                                <Camera size={16} />
                                <input
                                    id="profilePicture"
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">Click the camera icon to change your profile picture</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name Field */}
                        <div>
                            <label className="inline-flex ml-1 items-center text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                {...register("name")}
                                className="w-full px-3 py-2 border dark:placeholder:text-neutral-500 border-gray-300 dark:bg-neutral-700 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="inline-flex ml-1 items-center text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                {...register("username")}
                                className="w-full px-3 py-2 border dark:placeholder:text-neutral-500 border-gray-300 dark:bg-neutral-700 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        {/* Email - Read Only */}
                        <div>
                            <label className="inline-flex ml-1 items-center text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={authUser?.email || ""}
                                className="w-full px-3 py-2 border dark:text-gray-300 border-gray-200 dark:bg-gray-700 dark:border-neutral-600 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        {/* Bio - Full width */}
                        <div className="md:col-span-2">
                            <label className="inline-flex ml-1 items-center text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <Textarea
                                {...register("bio")}
                                rows={2}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full resize-none px-3 py-2 border dark:placeholder:text-neutral-500 dark:bg-neutral-700 dark:border-neutral-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Tell us about yourself"
                            />
                            <div className="text-right text-xs text-gray-500 ">
                                {text.length}/200
                            </div>
                            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 text-center">
                        <button
                            type="submit"
                            disabled={isEditing}
                            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md inline-flex items-center justify-center space-x-2 min-w-[120px]"
                        >
                            {isEditing ? (
                                <div className="px-10">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};