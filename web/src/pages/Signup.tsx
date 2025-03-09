import { MouseEvent, useState } from "react"
import { InputBox } from "../components/InputBox"
import { Button } from "../components/Button"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"

export const Signup = () => {
    const [name, setName] = useState("")
    const email = "parth@pvppcoe.ac.in"
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");
    const [department, setDepartment] = useState("")
    const [graduationYear, setGraduationYear] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPasword, setShowConfirmPassword] =useState(false)
    const { signup, isSigningUp } = useAuthStore()

    async function onClickHandler(e: MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        if(password === confirmPassword){
            signup({name, email, password, username, department, graduationYear})
        }
        else {
            toast.error("Passwords do not match")
        }
    }

    return <form> 
        <div className="flex justify-center">
            <div className="flex flex-col justify-center w-[30%] h-screen border-white">
                <div className="bg-yellow-400 p-4 rounded-lg">
                <InputBox label="Name" placeholder="Enter Your Full Name" type="text" onChange={(e => setName(e.target.value))} />    
                <InputBox label="Email" placeholder="Enter Your College Mail" type="email" value={email}  />
                <InputBox label="Username" placeholder="Enter Your Username" type="text" onChange={(e => setUsername(e.target.value))} />
                <div className="relative">
                    <InputBox label="Password" placeholder="Enter Password" type={showPassword ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} />
                    <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowPassword(!showPassword)} >
                            {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                    </div>
                </div>
                <div className="relative">
                    <InputBox label="Confirm Password" placeholder="Enter Confirm Password" type={showConfirmPasword ? "text" : "password"} onChange={(e => setConfirmPassword(e.target.value))} />
                    <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPasword)} >
                        {showConfirmPasword ? <EyeOff size={21} /> : <Eye size={21} />}
                    </div>
                </div>
                <div className="max-w-full flex gap-4">
                    <div>
                        <label className="mb-2 text-xs font-medium text-gray-900 dark:text-white">Your Department</label>
                            <select onChange={(e => setDepartment(e.target.value))} className="bg-gray-50 max-w-fit border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected>Select Your Department</option>
                                <option value="IT">Information Technology</option>
                                <option value="CS">Computer</option>
                                <option value="AI">Artificial Intelligence</option>
                                <option value="MT">Mechatronics</option>
                            </select>
                    </div>
                    <div>
                        <label className="mb-2 text-xs font-medium text-gray-900 dark:text-white">Year of Passing</label>
                            <select onChange={(e => setGraduationYear(parseInt(e.target.value)))} className="bg-gray-50 max-w-fit border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected className="text-center">Year of Passing</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                                <option value={2028}>2028</option>
                            </select>
                    </div>
                    
                </div>
                <div className="self-center">
                    <Button active={isSigningUp} label="Submit" onClick={onClickHandler} />
                </div>
                </div>
            </div>
        </div>
    </form>
}