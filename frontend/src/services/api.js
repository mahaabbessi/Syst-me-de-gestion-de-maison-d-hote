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

// ── Auth ──────────────────────────────────────
export const register   = (data) => API.post("/users/register", data);
export const signin     = (data) => API.post("/users/signin", data);
export const getProfile = ()     => API.get("/users/profile");

// ── Maisons ───────────────────────────────────
export const getAllMaisons = ()         => API.get("/maisons");
export const getMaisonById = (id)       => API.get(`/maisons/${id}`);
export const getMesMaisons = ()         => API.get("/maisons/owner/mes-maisons");
export const createMaison  = (data)     => API.post("/maisons", data);
export const updateMaison  = (id, data) => API.put(`/maisons/${id}`, data);
export const deleteMaison  = (id)       => API.delete(`/maisons/${id}`);

// ── Chambres (Sprint 3) ───────────────────────
export const getChambresByMaison = (maisonId)       => API.get(`/chambres/maison/${maisonId}`);
export const getChambreById      = (id)             => API.get(`/chambres/${id}`);
export const createChambre       = (maisonId, data) => API.post(`/chambres/maison/${maisonId}`, data);
export const updateChambre       = (id, data)       => API.put(`/chambres/${id}`, data);
export const deleteChambre       = (id)             => API.delete(`/chambres/${id}`);
// Ajouter ces fonctions
export const createReservation = (data) => API.post("/reservations", data);
export const getMesReservations = () => API.get("/reservations/mes-reservations");
export const annulerReservation = (id) => API.delete(`/reservations/${id}`);