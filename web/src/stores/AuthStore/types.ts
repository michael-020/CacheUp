import { IUser } from "../../lib/utils"

export type authState = {
    authUser: IUser | null,
    inputEmail: string
    isSigningUp: boolean
    isSigningIn: boolean
    isLoggingOut: boolean
    isCheckingAuth: boolean
    isVerifying: boolean
    sendingEmail: boolean
    isEditing: boolean
    onlineUsers: string[]
    socket: WebSocket | null
}

export type authAction = {
    signup: (data: {name: string, email: string, password: string, username: string, department: string, graduationYear: string}) => void;
    signin: (data: {email: string, password: string}) => void;
    logout: () => void;
    checkAuth: () => void;
    sentEmail: (data: {email: string}) => void;
    verifyEmail: (data: {email: string, otp: string}) => void;
    editProfile: (data: {name?: string, username?: string, profilePicture?: string, bio?: string}) => void;
    connectSocket: () => void;
    fetchOnlineUsers: () => void;
    disconnectSocket: () => void;
    getSocket: () => WebSocket | null; 
}
