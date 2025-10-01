import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminModeration from './admin/AdminModeration';

const Admin: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-background">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;