import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom"
import { Combobox } from "@/components/ui/combobox"

const VALID_DEPARTMENTS = ["IT", "CS", "AI", "MT"];
const VALID_GRADUATION_YEARS = [2025, 2026, 2027, 2028];

const graduationYearOptions = [
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
];
  
const departmentOptions = [
    { value: "IT", label: "Information Technology" },
    { value: "CS", label: "Computer Science" },
    { value: "AI", label: "Artificial Intelligence" },
    { value: "MT", label: "Mechanical Technology" },
];

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
      message: "Please select a valid Department"
    }),
  graduationYear: z.string()
    .transform((val) => parseInt(val, 10))
    .refine(val => VALID_GRADUATION_YEARS.includes(val), {
        message: "Please select a valid Year of Passing"
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
        control,
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

    return <div>
        <div className="flex justify-center items-center h-screen">
            <div className="w-[30%] p-4 rounded-lg bg-gray-900 flex flex-col">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name</label>
                        <input 
                            type="text" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your Full Name" 
                            {...register("name")}
                        />
                        {errors.name && <div className="text-red-600 -translate-y-3 text-sm">{errors.name.message}</div>}
                    </div>
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Email</label>
                        <input 
                            type="email" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your College Mail" 
                            {...register("email")}
                        />
                        {errors.email && <div className="text-red-600 -translate-y-3 text-sm">{errors.email.message}</div>}
                    </div>
        
                    <div>
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Username</label>
                        <input 
                            type="text" 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Your Username" 
                            {...register("username")}
                        />
                        {errors.username && <div className="text-red-600 -translate-y-3 text-sm">{errors.username.message}</div>}
                    </div>
        
                    <div className="relative">
                        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Password</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                            placeholder="Enter Password" 
                            {...register("password")}
                        />
                        {errors.password && <div className="text-red-600 -translate-y-3 text-sm">{errors.password.message}</div>}
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
                        {errors.confirmPassowrd && <div className="text-red-600 -translate-y-3 text-sm">{errors.confirmPassowrd.message}</div>}
                        <div className="absolute right-3 top-8 cursor-pointer text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPasword)}>
                        {showConfirmPasword ? <EyeOff size={21} /> : <Eye size={21} />}
                        </div>
                    </div>
            
                    <div>
                    <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Department</label>
                    <Controller
                        control={control}
                        name="department"
                        render={({ field }) => (
                        <Combobox options={departmentOptions} {...field} placeholder="Select Department..." />
                        )}
                    />
                        {errors.department && <div className="text-red-600 text-sm translate-y-1">{errors.department.message}</div>}
                    </div>

                    <div>
                        <label className="mb-2 block  text-xs font-medium text-gray-900 dark:text-white">Year of Passing</label>
                        <Controller
                            control={control}
                            name="graduationYear"
                            render={({ field }) => (
                                <Combobox
                                    options={graduationYearOptions}
                                    value={field.value} 
                                    onChange={(val) => field.onChange(val)} 
                                    placeholder="Select Year of Passing"
                                />
                            )}
                        />
                        {errors.graduationYear && <div className="text-red-600 text-sm translate-y-1">{errors.graduationYear.message}</div>}
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
                </form>
                <div className="text-white flex gap-1 mx-auto">
                    <span>
                        Already have an Account?
                    </span>
                    <Link to={"/signin"} className="text-yellow-400 hover:underline hover:text-blue-500">
                        Signin
                    </Link>
                </div>
            </div>
        </div>
    </div>
}