import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const HTTP_URL="http://localhost:3000/api/v1"

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
  username: string;
  profilePicture: string
  date: Date;          
}

export interface IAdmin {
  _id: string;
  name: string;
  adminId: string;
}
