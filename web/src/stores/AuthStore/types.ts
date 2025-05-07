import { IUser, SetupFormData } from "../../lib/utils"

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
    token: string | ""
    authChecked: boolean
    isSettingUp: boolean
}

export type authAction = {
    signup: (data: {name: string, email: string, password: string, username: string}) => void;
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
    getToken: () => void;
    deleteAccount: () => void;
    handleGoogleSignin: () => void;
    handleGoogleAuthError: () => void;
    handleGoogleSignup: () => void;
    setupGoogleAccount: (data: SetupFormData) => Promise<void>;
    checkSetupSession: () => Promise<string>;
}
