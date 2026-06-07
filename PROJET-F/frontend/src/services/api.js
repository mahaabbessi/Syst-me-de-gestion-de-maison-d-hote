import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const register = (data) => API.post("/users/register", data);
export const signin = (data) => API.post("/users/signin", data);
export const getProfile = () => API.get("/users/profile");