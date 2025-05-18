import { MouseEvent, useState, useEffect } from "react" // Add useEffect
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { Eye, EyeOff, Loader } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation"

export const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { signin, isSigningIn, handleGoogleSignin, handleGoogleAuthError } = useAuthStore()
    const location = useLocation()
    
    // Check for Google auth errors on page load
    useEffect(() => {
        handleGoogleAuthError();
    }, [location.search, handleGoogleAuthError]);

    async function onClickHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        signin({email, password})
    }
    
    return (
        <motion.div 
            className="min-h-screen grid dark:text-black place-items-center px-4 py-6 sm:px-6 md:px-8"
            variants={routeVariants}
            initial="initial"
            animate="final"
            exit="exit"    
        >
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
                <div className="grid gap-4 sm:gap-5 md:gap-6">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-black text-blue-600">Sign In</h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-200 mt-1 sm:mt-2">Welcome back to CatcheUp Network</p>
                    </div>
                    
                    <form className="grid gap-4 sm:gap-5">
                        {/* Email */}
                        <div className="grid gap-1 sm:gap-2">
                            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-200">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 bg-blue-50/50 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="xyz@gmail.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="grid gap-1 sm:gap-2">
                            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-200">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-blue-50/50 dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder:text-gray-400/40 border border-gray-200 dark:border-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 dark:hover:text-gray-100 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-1 sm:pt-2">
                            <button
                                type="submit"
                                disabled={isSigningIn}
                                onClick={onClickHandler}
                                className={`w-full py-2 sm:py-3 ${isSigningIn ? "bg-blue-800": " bg-blue-600 hover:bg-blue-700"} dark:text-gray-200 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md`}
                            >
                                {isSigningIn ? <div className="flex items-center justify-center"> <Loader className="animate-spin self-center w-4 h-4 sm:w-5 sm:h-5" /> </div>: 'Sign In'}
                               
                            </button>
                        </div>

                        <div className="text-center pt-2 sm:pt-4">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-blue-500 font-medium hover:text-blue-600">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="relative my-1 sm:my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-neutral-600" />
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                            <span className="px-2 bg-white dark:bg-neutral-800 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignin}
                        className="w-full flex items-center justify-center gap-1 sm:gap-2 p-2 border bg-gray-50 hover:bg-gray-100 rounded-lg dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-white text-xs sm:text-sm"
                    >
                        <img src="/google.svg" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}