import apiClient from './apiClient';

export const fetchWelfareDashboard = () => apiClient.get('/welfare/dashboard');
