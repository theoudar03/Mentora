import apiClient from './apiClient';

export const fetchStudents = () => apiClient.get('/students');
export const changePassword = (data) => apiClient.patch('/students/change-password', data);
