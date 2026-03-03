import apiClient from './apiClient';

export const fetchMentorDashboard = () => apiClient.get('/mentor/dashboard');
