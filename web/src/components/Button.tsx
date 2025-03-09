import { Loader } from "lucide-react";
import { MouseEventHandler } from "react"

interface ButtonTypes {
    onClick?: (MouseEventHandler<HTMLButtonElement>);
    label: string;
    active: boolean,
    type?: "submit" | "reset" | "button" | undefined
}
export const Button = ({onClick, label, active, type}: ButtonTypes) => {
    return <button 
                disabled={active}
                onClick={onClick} 
                type={type} 
                className="w-full mt-5 flex justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >   
                <div>{active ? <Loader className="animate-spin size-5" /> : label}</div>
            </button>
}