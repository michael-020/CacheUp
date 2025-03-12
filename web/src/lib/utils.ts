import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const HTTP_URL="http://localhost:8000/api/v1"

export interface IUser {
    _id: string
    name: string;
    username: string;
    email: string;
    password: string;
    profileImagePath?: string;
    department: string;
    graduationYear: number;
    bio?: string;
    posts: IPost[];
    friends: IUser[];
    friendRequests: IUser[];
}

export interface IPost {
    _id: string,
    image: string,
    caption: string
}

export interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface Post {
  _id: string;
  content?: string;
  image?: string;
  // author: string;
  username: string;
  likesCount: number;
  comments: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

// Posts type:
    // postedBy: userId,
    // username: user.username,
    // userImagePath: user.profileImagePath,
    // postsImagePath: imagePath, 
    // text,
    // likes: [],
    // reportedBy: [],
    // comments: []