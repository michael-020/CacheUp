import { ChangeEvent } from "react"

interface InputBoxTypes {
    label: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type: string;
    value?: string;
    className?: string;
    }
export const InputBox = ({label, onChange, placeholder, type, value}: InputBoxTypes) => {
    return <div>
        <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">{label}</label>
        <input onChange={onChange} type={type} id="first_name" value={value} className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  placeholder={placeholder} required />
    </div>
}