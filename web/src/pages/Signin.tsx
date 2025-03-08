import { MouseEvent, useState } from "react"
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"

export const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { signin, isSigningIn } = useAuthStore()

    async function onClickHandler (e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        signin({email, password})
    }
    
    return <div className="flex justify-center">
        <div className="flex flex-col justify-center w-[30%] h-screen border-white">
            <div className="bg-yellow-400 p-4 rounded-lg">
                <InputBox label="Email" placeholder="Enter Your College Mail" type="email" onChange={(e => setEmail(e.target.value))}  />
                <InputBox label="Password" placeholder="Enter Password" type="password" onChange={(e => setPassword(e.target.value))} />
            <div className="self-center">
                <Button active={isSigningIn} label="Submit" onClick={onClickHandler} />
            </div>
        </div>
    </div>
</div>
}