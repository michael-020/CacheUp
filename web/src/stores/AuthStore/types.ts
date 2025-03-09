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
}

export type authAction = {
    signup: (data: {name: string, email: string, password: string, username: string, department: string, graduationYear: number}) => void;
    signin: (data: {email: string, password: string}) => void;
    logout: () => void;
    checkAuth: () => void;
    sentEmail: (data: {email: string}) => void;
    verifyEmail: (data: {email: string, otp: string}) => void;
}
