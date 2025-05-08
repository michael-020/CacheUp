import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const HTTP_URL=`${import.meta.env.VITE_API_URL}/api/v1`

export const WS_URL = "ws://localhost:4000" 

export function formatMessageTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  // Format like "27 SEPTEMBER 2013"
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export interface IUser {
    _id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    profilePicture: string;
    department: string;
    graduationYear: number;
    bio: string; 
    posts: IPost[]; 
    friends: IUser[]; 
    friendRequests: IUser[]; 
    lastUsernameChangeDate?: string;
    mutualFriends?: number;
    isFriend?: boolean;
    hasPendingRequest?: boolean;
}

export interface LikedUser {
  _id: string;
  username: string;
  profileImagePath?: string | null;
}

export interface IPost {
    _id: string,
    image: string,
    caption: string
}

export interface Post {
  _id: string;
  text?: string;          
  postsImagePath?: string; 
  username: string;       
  userImagePath: string;  
  likes: string[];        
  comments: Comment[];    
  isLiked: boolean;           
  isSaved: boolean;      
  createdAt: Date;        
  postedBy?: string;      
  reportedBy?: string[]; 
  isReported: boolean;
  reportCount: number;
}

export interface Comment {
  _id: string;
  content: string;       
  user: Partial<IUser>
  date: Date;          
}

export interface IAdmin {
  _id: string;
  name: string;
  adminId: string;
}

export const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
  confirmPassword: z.string(),
  profilePicture: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SetupFormData = z.infer<typeof setupSchema>;