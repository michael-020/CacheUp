import axios from "axios";
axios.defaults.family = 4

export const embedtext = async (text: string) => {
    const res = await axios.get(`http://localhost:8081/vectorize?text=${text}`)
    return res.data.vector
}