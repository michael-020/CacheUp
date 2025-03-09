import { MouseEvent, useState } from "react"
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { Eye, EyeOff } from "lucide-react"

export const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { signin, isSigningIn } = useAuthStore()

    async function onClickHandler (e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        signin({email, password})
    }
    
    return <div className="flex justify-center">
        <div className="flex flex-col justify-center w-[30%] h-screen border-white">
            <div className="bg-yellow-400 p-4 rounded-lg">
                <InputBox label="Email" placeholder="Enter Your College Mail" type="email" onChange={(e => setEmail(e.target.value))}  />
                <div className="relative">
                <InputBox label="Password" placeholder="Enter Password" type={showPassword ? "text": "password"} onChange={(e => setPassword(e.target.value))} />
                <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowPassword(!showPassword)} >
                            {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                    </div>
                </div>
            <div className="self-center">
                <Button active={isSigningIn} label="Submit" onClick={onClickHandler} />
            </div>
        </div>
    </div>
</div>
}