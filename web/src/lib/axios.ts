import axios from "axios";
import { HTTP_URL } from "./utils";

export const axiosInstance = axios.create({
    baseURL: HTTP_URL, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json', 
    }
})