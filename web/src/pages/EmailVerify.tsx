import { MouseEvent, useState } from "react";
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";

export const EmailVerify = () => {
    const { sentEmail, sendingEmail, verifyEmail, isVerifying } = useAuthStore();
    const [email, setEmail] = useState("")
    const [spanInput, setSpanInput] = useState(false);
    const [otp, setOtp] = useState("")
    const navigate = useNavigate()
    async function onClickHandler(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        sentEmail({email})
        setSpanInput(true)
    }
    async function otpHandler (e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        verifyEmail({email, otp})
        navigate("/signup")
    }
    return <motion.div 
                className="flex justify-center"
                variants={routeVariants}
                initial="initial"
                animate="final"
                exit="exit"
            >
        <div className="flex flex-col justify-center  w-[30%] h-screen border-white">
        <div className="bg-white border border-gray-400 dark:border-neutral-600 shadow-lg dark:bg-neutral-700 p-4 rounded-lg">
            <div className="flex justify-between">
                <div className="w-[65%]">
                    <InputBox type="email" label="Email" placeholder="Enter Your College Email" onChange={(e => setEmail(e.target.value))} />
                </div>
                <div className="w-[31%] mt-1">
                    <Button label="Send OTP" onClick={onClickHandler} active={sendingEmail}/>
                </div>
            </div>
            { spanInput && <> 
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
            </> }
        </div>
        </div>
        
    </motion.div>
}