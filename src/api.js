import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || "https://steppeway-back-end.vercel.app/";

const api = axios.create({baseURL: BASE});
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const login = (u, p) => api.post('/api/auth/login', {username: u, password: p});
export const getHero = () => api.get('/api/hero');
export const updateHero = (d) => api.put('/api/hero', d);
export const uploadHeroMedia = (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/hero/upload', fd);
};
export const getAbout = () => api.get('/api/about');
export const updateAbout = (d) => api.put('/api/about', d);
export const uploadAboutImg = (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/about/upload', fd);
};
export const getTours = () => api.get('/api/tours/all');
export const createTour = (d) => api.post('/api/tours', d);
export const updateTour = (id, d) => api.put(`/api/tours/${id}`, d);
export const deleteTour = (id) => api.delete(`/api/tours/${id}`);
export const uploadTourImg = (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/tours/${id}/upload`, fd);
};
export const getContact = () => api.get('/api/contact');
export const updateContact = (d) => api.put('/api/contact', d);
export const getMessages = () => api.get('/api/contact/messages');
export const getImgUrl = (url) => url ? `${BASE}${url}` : null;
