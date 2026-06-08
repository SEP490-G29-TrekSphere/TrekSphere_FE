import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy loading features
const Dashboard = React.lazy(() => import('@/features/dashboard/Dashboard'));
const Login = React.lazy(() => import('@/features/auth/Login'));

// Basic loading fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
