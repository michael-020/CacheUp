import { IUser } from "../../lib/utils"

export type authState = {
    authUser: IUser | null,
    isSigningUp: boolean
    isSigningIn: boolean
    isLoggingOut: boolean
}

export type authAction = {
    signup: (data: {email: string, password: string, username: string, department: string, graduationYear: string}) => void;
    signin: (data: {email: string, password: string}) => void;
    logout: () => void;
}
