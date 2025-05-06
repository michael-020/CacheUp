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
        <input onChange={onChange} type={type} id="first_name" value={value} className="mb-4 bg-gray-100 border placeholder:text-neutral-300 border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-neutral-800 focus:border-neutral-800 block w-full p-2.5 dark:bg-neutral-700 dark:border-neutral-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-neutral-800 dark:focus:border-neutral-800"  placeholder={placeholder} required />
    </div>
}