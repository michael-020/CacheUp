import { MouseEvent, useState } from "react";
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";

export const EmailVerify = () => {
    const { sentEmail, sendingEmail, verifyEmail, isVerifying, inputEmail } = useAuthStore();
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const navigate = useNavigate()

    async function onClickHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await sentEmail({email})
    }

    async function otpHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        await verifyEmail({email, otp})
        navigate("/signup")
    }

    const handleGoogleSignIn = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };
    
    return (
        <motion.div 
            className="flex justify-center"
            variants={routeVariants}
            initial="initial"
            animate="final"
            exit="exit"
        >
            <div className="flex flex-col justify-center w-[30%] h-screen">
                <div className="bg-white border border-gray-400 dark:border-neutral-600 shadow-lg dark:bg-neutral-700 p-6 rounded-lg">
                    <div className="flex flex-col space-y-4">
                        <div className="flex space-x-2">
                            <div className="w-2/3">
                                <InputBox 
                                    type="email" 
                                    label="Email" 
                                    placeholder="Enter Your College Email" 
                                    onChange={(e => setEmail(e.target.value))} 
                                />
                            </div>
                            <div className="w-1/3 self-end">
                                <Button 
                                    label="Send OTP" 
                                    onClick={onClickHandler} 
                                    active={sendingEmail}
                                />
                            </div>
                        </div>
                        
                        {inputEmail === email && inputEmail !== "" && (
                            <div className="flex flex-col space-y-3 mt-2">
                                <InputBox 
                                    type="text" 
                                    label="OTP" 
                                    placeholder="Enter the OTP" 
                                    onChange={(e) => setOtp((e.target.value))} 
                                /> 
                                <Button 
                                    label="Submit OTP" 
                                    active={isVerifying} 
                                    onClick={otpHandler} 
                                /> 
                            </div>
                        )}
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-neutral-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-neutral-700 text-gray-500">
                                Or verify with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors"
                    >
                        <img src="/google.svg" alt="Google" className="w-6 h-6" />
                        <span className="dark:text-gray-200">Continue with Google</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}