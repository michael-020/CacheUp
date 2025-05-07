import axios from "axios";
axios.defaults.family = 4

export const embedtext = async (text: string) => {
    const url = process.env.TRANSFORMER_API
    const res = await axios.get(`${url}/vectorize?text=${text}`)
    return res.data.vector
}