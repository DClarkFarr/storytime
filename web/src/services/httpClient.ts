import axios from "axios";

const httpClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE.replace(/^\/+|\/+$/, "")}/api/`,
    withCredentials: true,
});

export default httpClient;
