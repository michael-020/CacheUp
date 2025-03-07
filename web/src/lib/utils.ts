export const HTTP_URL="http://localhost:3000/api/v1"

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