import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import StudentDashboard from '../pages/student/StudentDashboard';
import SurveySession from '../pages/student/SurveySession';
import MentorDashboard from '../pages/mentor/MentorDashboard';
import WelfareDashboard from '../pages/welfare/WelfareDashboard';
import ChatPage from '../pages/chat/ChatPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Secure Survey Session (No Sidebar) */}
      <Route element={<DashboardLayout allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentDashboard />} />
      </Route>
      
      {/* Standalone Route for Full-Screen Mode */}
      <Route path="/student/session" element={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <SurveySession />
        </div>
      } />

      {/* Mentor Routes */}
      <Route element={<DashboardLayout allowedRoles={['mentor']} />}>
        <Route path="/mentor" element={<MentorDashboard />} />
      </Route>

      {/* Welfare Routes */}
      <Route element={<DashboardLayout allowedRoles={['welfare']} />}>
        <Route path="/welfare" element={<WelfareDashboard />} />
      </Route>

      {/* Chat — all authenticated roles */}
      <Route element={<DashboardLayout allowedRoles={['student', 'mentor', 'welfare']} />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
