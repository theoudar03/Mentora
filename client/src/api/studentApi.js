import apiClient from './apiClient';

export const fetchStudents = () => apiClient.get('/students');
export const getPasswordStatus = () => apiClient.get('/students/password-status');
export const changePassword = (data) => apiClient.patch('/students/change-password', data);
