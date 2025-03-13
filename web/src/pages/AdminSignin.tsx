import { MouseEvent, useState } from "react"
import { Button } from "../components/Button"
import { InputBox } from "../components/InputBox"
import { Eye, EyeOff } from "lucide-react"
import { useAdminStore } from "@/stores/AdminStore/useAdminStore"

export const AdminSignin = () => {
    const [adminId, setAdminId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { signin, isAdminSigninIn } = useAdminStore()

    async function onClickHandler (e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        signin({adminId, password})
    }
    
    return <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-400">
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="grid gap-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-indigo-600">Admin Sign In</h1>
            </div>
            
            <form className="grid gap-5">
                {/* Email */}
                <div className="grid gap-2">
                    <label className="text-gray-600">Admin Id</label>
                    <input
                        type="email"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        className="w-full px-4 py-3 bg-blue-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter admin id"
                    />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                    <label className="text-gray-600">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-blue-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isAdminSigninIn}
                        onClick={onClickHandler}
                        className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md"
                    >
                        {isAdminSigninIn ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
}