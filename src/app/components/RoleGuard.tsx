'use client';

import React from 'react';
import { useUserContext } from '../contexts/UserContext';
import { hasPermission } from '../utils/roleManager';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback 
}: RoleGuardProps) {
  const { userWithRole, isLoading, mounted, dbUser } = useUserContext();

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userWithRole || !dbUser) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Please log in to access this page.</p>
          <a
            href="/api/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  // Check role requirement - use database role
  if (requiredRole) {
    const userRole = dbUser.role === 'MANAGER' ? 'MANAGER' : 'CAREWORKER';
    if (userRole !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-600">Required: {requiredRole}, Your role: {userRole}</p>
        </div>
      </div>
    );
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userWithRole.role, requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have the required permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 