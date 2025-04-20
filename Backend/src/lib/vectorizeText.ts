import axios from "axios";
axios.defaults.family = 4

export const embedtext = async (text: string) => {
    const url = process.env.DOCKER ? "http://transformer_api:8081" : "http://localhost:8081";
    const res = await axios.get(`${url}/vectorize?text=${text}`)
    return res.data.vector
}