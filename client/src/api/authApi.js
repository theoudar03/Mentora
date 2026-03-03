import apiClient from './apiClient';

export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const getMe = () => apiClient.get('/auth/me');
export const logoutUser = () => apiClient.post('/auth/logout');
