import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader } from "lucide-react"
import { z } from "zod"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { Combobox } from "@/components/ui/combobox"
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation"

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
            console.error(error)
            toast.error("Registration failed")
        }
    }

    return (
        <motion.div 
            className="min-h-screen flex items-center justify-center dark:text-white"
            variants={routeVariants}
            initial="initial"
            animate="final"
            exit="exit"
        >
            <div className="w-full max-w-xl bg-white dark:bg-neutral-700 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-white/20">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Sign Up</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Join the PVPPCOE Campus Network</p>
            </div>
    
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Full Name</label>
                    <input
                    type="text"
                    {...register("name")}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-gray-600/60 dark:placeholder:text-gray-400/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
    
                {/* Username */}
                <div>
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Username</label>
                    <input
                    type="text"
                    {...register("username")}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-gray-600/60 dark:placeholder:text-gray-400/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>
    
                {/* Email */}
                <div>
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">College Email</label>
                    <input
                    type="email"
                    {...register("email")}
                    placeholder="you@pvppcoe.ac.in"
                    className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-gray-600/60 dark:placeholder:text-gray-400/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
    
                {/* Department */}
                <div>
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Department</label>
                    <div className="border border-gray-300 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-600/60 rounded-lg">
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
                    {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
                </div>
    
                {/* Password */}
                <div className="relative">
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Password</label>
                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Create password"
                        className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-gray-600/60 dark:placeholder:text-gray-400/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
    
                {/* Graduation Year */}
                <div>
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Graduation Year</label>
                    <div className="border border-gray-300 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-600/60 rounded-lg">
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
                    {errors.graduationYear && <p className="text-red-400 text-xs mt-1">{errors.graduationYear.message}</p>}
                </div>
    
                {/* Confirm Password */}
                <div className="relative">
                    <label className="text-gray-600 dark:text-gray-200 text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        placeholder="Confirm password"
                        className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-gray-600/60 dark:placeholder:text-gray-400/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                </div>
    
                <div className="pt-3">
                <button
                    type="submit"
                    disabled={isSigningUp}
                    className={`w-full py-3 ${isSigningUp ? "bg-indigo-400": "dark:bg-indigo-500 dark:hover:bg-indigo-600 bg-indigo-600 hover:bg-indigo-700"} dark:text-gray-200  text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md`}
                >
                    {isSigningUp ? <div className="flex items-center justify-center"> <Loader className="animate-spin self-center" /> </div>: 'Sign up'}
                </button>
                </div>
    
                <div className="text-center pt-2">
                <p className="text-gray-600 dark:text-gray-300">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800">
                    Sign In
                    </Link>
                </p>
                </div>
            </form>
            </div>
        </motion.div>
    )
}