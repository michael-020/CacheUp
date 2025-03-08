import { MouseEvent, useState } from "react"
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import axios from "axios"
import { useNavigate } from "react-router-dom"




export const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function onClickHandler (e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setError("");
        if(!(email && password)){
            setError("All the fields are necessary")
        }
        const response = await axios.post("http://localhost:3001/api/v1/user/signin",{
            email,
            password
        })
        if(response.data.error){
            setError("Could'nt sign you in" + error)
        }
        else{
            const token = response.data.token
            localStorage.setItem("token", token)
            navigate("/home")
        }
    }
    
    return <div className="flex justify-center">
        <div className="flex flex-col justify-center w-[30%] h-screen border-white">
            <div className="bg-yellow-400 p-4 rounded-lg">
                {error && <p className="text-red-600">{error}</p>}
                <InputBox label="Email" placeholder="Enter Your College Mail" type="email" onChange={(e => setEmail(e.target.value))}  />
                <InputBox label="Password" placeholder="Enter Password" type="password" onChange={(e => setPassword(e.target.value))} />
            <div className="self-center">
                <Button label="Submit" onClick={onClickHandler} />
            </div>
        </div>
    </div>
</div>
}