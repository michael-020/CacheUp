import { z } from "zod";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export const EditProfile = () => {
    const updateSchema = z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        profilePicture: z.string().optional(), // Changed from `any` to `string | undefined`
        bio: z.string().optional(),
    }).strict({ message: "Extra fields not allowed" });

    type FormFields = z.infer<typeof updateSchema>;

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<FormFields>({
        resolver: zodResolver(updateSchema),
    });

    const { isEditing, editProfile } = useAuthStore();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Function to convert file to Base64
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
                setValue("profilePicture", base64); // Set as Base64 in form state
                setImagePreview(URL.createObjectURL(file)); // Display image preview
            } catch (error) {
                toast.error("Failed to process image.");
            }
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { name, username, bio, profilePicture } = data;

            const sanitizedData = {
                name,
                username,
                bio,
                profilePicture: profilePicture ?? undefined,  
            };

            await editProfile(sanitizedData);
            console.log(sanitizedData);
        } catch (error) {
            setError("root", {
                message: "Profile update failed",
            });
            toast.error("Profile update failed");
        }
    };

    const { authUser } = useAuthStore()

    return (
        <div className="mt-32 h-screen flex-col justify-center">
            <div className="flex justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2">
                
                {/* Profile Picture Upload */}
                <div>
                    <img src={authUser?.profilePicture} className="w-14 h-14 rounded-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edit Profile Picture</label>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileUpload} // Using the new handler
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
                    )}
                    {errors.profilePicture && (
                        <p className="text-red-500 text-xs mt-1">
                            {typeof errors.profilePicture.message === "string" ? errors.profilePicture.message : "Invalid input"}
                        </p>
                    )}
                </div>

                {/* Full Name */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Present Full Name</label>
                {authUser?.name}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Full Name</label>
                    <input
                        type="text"
                        {...register("name")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Username */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Present Username</label>
                {authUser?.username}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Username</label>
                    <input
                        type="text"
                        {...register("username")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter your username"
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>

                {/* Bio */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Present Bio</label>
                {authUser?.bio}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Bio</label>
                    <input
                        type="text"
                        {...register("bio")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter your bio"
                    />
                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                </div>

                </div>
                {/* Submit Button */}
                <div className="pt-3 w-40 justify-self-center">
                    <button
                        type="submit"
                        disabled={isEditing}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isEditing ? 'Editing...' : 'Edit Details'}
                    </button>
                </div>
            </form>
            </div>
            
        </div>
    );
};
