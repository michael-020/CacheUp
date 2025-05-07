import { MouseEvent, useState, useEffect } from "react";
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";
import { Loader } from "lucide-react";

export const EmailVerify = () => {
    const { 
        sentEmail, 
        sendingEmail, 
        verifyEmail, 
        isVerifying, 
        handleGoogleSignup,
        handleGoogleAuthError,
        inputEmail 
    } = useAuthStore();
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        handleGoogleAuthError();
    }, [location.search, handleGoogleAuthError]);

    async function onClickHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await sentEmail({email})
    }

    async function otpHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await verifyEmail({email, otp})
        navigate("/signup")
    }

    return (
    <motion.div 
        className="flex justify-center px-4 sm:px-0"
        variants={routeVariants}
        initial="initial"
        animate="final"
        exit="exit"
    >
        <div className="flex flex-col justify-center w-full sm:w-96 min-h-screen py-8 sm:py-0">
            <div className="bg-white border border-gray-400 dark:border-neutral-700 shadow-lg dark:bg-neutral-800 p-4 sm:p-6 rounded-lg">
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-[1.8rem] text-blue-600 font-black">
                        Email Verification
                    </h2> 
                    <p className="text-xs sm:text-sm dark:text-neutral-300 text-black/70 mt-2">
                        Verify Your email to proceed
                    </p>
                </div>
                <div className="flex flex-col space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div className="w-full sm:w-2/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input 
                                type="email" 
                                placeholder="Enter Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="w-full sm:w-1/3 mt-0 sm:mt-6">
                            <button 
                                onClick={onClickHandler}
                                disabled={sendingEmail}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sendingEmail ? (
                                    <Loader className="w-5 h-5 mx-auto animate-spin" />
                                ) : (
                                    'Send OTP'
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {inputEmail === email && inputEmail !== "" && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <div className="w-full sm:w-2/3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    OTP
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Enter the OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            <div className="w-full sm:w-1/3 mt-0 sm:mt-6">
                                <button
                                    onClick={otpHandler}
                                    disabled={isVerifying}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isVerifying ? (
                                        <Loader className="w-5 h-5 mx-auto animate-spin" />
                                    ) : (
                                        'Submit OTP'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Already have an account?{" "}
                            <Link to="/signin" className="text-blue-500 font-medium hover:text-blue-600">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-neutral-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-neutral-800 text-gray-500">
                            Or verify with
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-2 p-2 border bg-gray-50 hover:bg-gray-100 rounded-lg dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-white"
                >
                    <img src="/google.svg" alt="Google" className="w-6 h-6" />
                    <span className="text-sm dark:text-gray-200">Sign up with Google</span>
                </button>
            </div>
        </div>
    </motion.div>
    );
}