import axios from "axios";
import { HTTP_URL } from "./utils";

export const AxiosInstance = axios.create({
    baseURL: import.meta.env.MODE == "development" ? `${HTTP_URL}` : "/api/v1", 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json', 
    }
})