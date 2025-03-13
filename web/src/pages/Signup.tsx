import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { Combobox } from "@/components/ui/combobox"

const VALID_DEPARTMENTS = ["IT", "CS", "AI", "MT"];
const VALID_GRADUATION_YEARS = ["2025", "2026", "2027", "2028"];

const graduationYearOptions = [
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
];
  
const departmentOptions = [
    { value: "IT", label: "Information Technology" },
    { value: "CS", label: "Computer Engineering" },
    { value: "AI", label: "Artificial Intelligence and Data Science" },
    { value: "MT", label: "Mechatronics" },
];

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Valid email is required").refine((val) => val.endsWith('@pvppcoe.ac.in'), {
      message: "Only emails ending with @pvppcoe.ac.in can register"
    }),
    password: z.string()
      .min(8, "Password should be at least 8 characters")
      .max(100, "Password should not exceed 100 characters")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
    confirmPassword: z.string(),
    department: z.string()
      .refine(val => VALID_DEPARTMENTS.includes(val), {
        message: "Please select a valid Department"
      }),
    graduationYear: z.string()
      .refine(val => VALID_GRADUATION_YEARS.includes(val), {
        message: "Please select a valid Year of Passing"
      }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

type FormFields = z.infer<typeof schema>

export const Signup = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { signup, isSigningUp, inputEmail } = useAuthStore()
    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: {errors}
    } = useForm<FormFields>({
        defaultValues: {
            email: inputEmail || ""
        },
        resolver: zodResolver(schema)
    })

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const {name, email, password, username, department, graduationYear} = data;
            await signup({name, email, password, username, department, graduationYear})
            console.log(data)
        } catch (error) {
            setError("root", {
                message: "Registration failed"
            })
            toast.error("Registration failed")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-400 p-4">
    <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-white/20">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Sign Up</h1>
            <p className="text-gray-600 mt-2">Join the PVPPCOE Campus Network</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        {...register("name")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        {...register("username")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Choose a username"
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="you@pvppcoe.ac.in"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Department */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="w-full border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                        <Controller
                            control={control}
                            name="department"
                            render={({ field }) => (
                                <Combobox 
                                    options={departmentOptions} 
                                    {...field} 
                                    placeholder="Select Department"
                                    className="w-full px-4 py-2.5"
                                />
                            )}
                        />
                    </div>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>

                {/* Password */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Create password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Graduation Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <div className="w-full border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                        <Controller
                            control={control}
                            name="graduationYear"
                            render={({ field }) => (
                                <Combobox 
                                    options={graduationYearOptions} 
                                    {...field} 
                                    placeholder="Select Year of Passing"
                                    className="w-full px-4 py-2.5"
                                />
                            )}
                        />
                    </div>
                    {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <div className="pt-3">
                <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {isSigningUp ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    </div>
</div>
    )
}