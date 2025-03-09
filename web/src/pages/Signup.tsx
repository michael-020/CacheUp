import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";

const VALID_DEPARTMENTS = ["IT", "CS", "AI", "MT"];
const VALID_GRADUATION_YEARS = [2025, 2026, 2027, 2028];

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email().refine((val) => val.endsWith('@pvppcoe.ac.in'), {
      message: "Only Emails ending with @pvppcoe.ac.in can register"
    }),
    password: z.string()
      .min(8, "Password should be at least 8 characters")
      .max(100, "Password should not exceed 100 characters")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
    confirmPassowrd: z.string(),
    department: z.string()
    .refine(val => VALID_DEPARTMENTS.includes(val), {
      message: "Please select a valid department"
    }),
  graduationYear: z.string()
    .transform((val) => parseInt(val, 10))
    .refine(val => VALID_GRADUATION_YEARS.includes(val), {
      message: "Please select a valid graduation year"
    }),
  }).refine((data) => data.password === data.confirmPassowrd, {
    message: "Passwords do not match",
    path: ["confirmPassowrd"]
});

type FormFields = z.infer<typeof schema>

export const Signup = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPasword, setShowConfirmPassword] =useState(false)
    const { signup, isSigningUp, inputEmail } = useAuthStore()
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors}
    } = useForm<FormFields>({
        defaultValues: {
            email: JSON.stringify(Math.random()) + "@pvppcoe.ac.in" // todo: add inputEmail here
        },
        resolver: zodResolver(schema)
    })

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const {name, email: inputEmail, password, username, department, graduationYear} = data;
            signup({name, email: inputEmail, password, username, department, graduationYear})
            console.log(data)
        } catch (error) {
            setError("root", {
                message: errors.root?.message
            })
            console.log(errors.root?.message)
            toast.error(JSON.stringify(errors.root?.message))
        }
    }

    if (errors.department) {
        toast.error(errors.department.message as string);
    }
    
    if (errors.graduationYear) {
        toast.error(errors.graduationYear.message as string);
    }

    return <form onSubmit={handleSubmit(onSubmit)}> 
        <div className="flex justify-center">
            <div className="flex flex-col justify-center w-[30%] h-screen border-white">
                <div className="bg-gray-900 p-4 rounded-lg">
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name</label>
                        <input 
                            type="text" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your Full Name" 
                            {...register("name")}
                        />
                        {errors.name && <div className="text-red-600 -translate-y-2 text-sm">{errors.name.message}</div>}
                    </div>
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Email</label>
                        <input 
                            type="email" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your College Mail" 
                            {...register("email")}
                        />
                        {errors.email && <div className="text-red-600 -translate-y-2 text-sm">{errors.email.message}</div>}
                    </div>
        
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Username</label>
                        <input 
                            type="text" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your Username" 
                            {...register("username")}
                        />
                        {errors.username && <div className="text-red-600 -translate-y-2 text-sm">{errors.username.message}</div>}
                    </div>
        
                    <div className="relative">
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Password</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Password" 
                            {...register("password")}
                        />
                        {errors.password && <div className="text-red-600 -translate-y-2 text-sm">{errors.password.message}</div>}
                        <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                        </div>
                    </div>
            
                    <div className="relative">
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Confirm Password</label>
                        <input 
                            type={showConfirmPasword ? "text" : "password"} 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Confirm Password" 
                            {...register("confirmPassowrd")}
                        />
                        {errors.confirmPassowrd && <div className="text-red-600 -translate-y-2 text-sm">{errors.confirmPassowrd.message}</div>}
                        <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPasword)}>
                        {showConfirmPasword ? <EyeOff size={21} /> : <Eye size={21} />}
                        </div>
                    </div>
            
                    <div className="max-w-full flex justify-between">
                        <div>
                            <label className="mb-2 text-xs font-medium text-gray-900 dark:text-white">Your Department</label>
                            <select {...register("department")} className="bg-gray-50 max-w-fit border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected>Select Your Department</option>
                                <option value="IT">Information Technology</option>
                                <option value="CS">Computer</option>
                                <option value="AI">Artificial Intelligence</option>
                                <option value="MT">Mechatronics</option>
                            </select>
                            {errors.department && <div className="text-red-600 text-xs">{errors.department.message}</div>}
                        </div>
                        <div>
                            <label className="mb-2 text-xs font-medium text-gray-900 dark:text-white">Year of Passing</label>
                            <select {...register("graduationYear")} className="bg-gray-50 max-w-fit border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option selected className="text-center">Year of Passing</option>
                                <option value={2025}>{2025}</option>
                                <option value={2026}>{2026}</option>
                                <option value={2027}>{2027}</option>
                                <option value={2028}>{2028}</option>
                            </select>
                            {errors.graduationYear && <div className="text-red-600 text-xs">{errors.graduationYear.message}</div>}
                        </div>
                    </div>
            
                    <div className="self-center">
                        <button 
                            type="submit" 
                            disabled={isSigningUp}
                            className="w-full mt-5 flex justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
  </form>
}