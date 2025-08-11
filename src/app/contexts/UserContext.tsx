'use client';

import React, { createContext, useContext } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';
import { ROLES } from '../utils/roleManager';

interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  profilePicUrl?: string | null;
  role: 'CAREWORKER' | 'MANAGER';
  averageHours?: number | null;
  totalShifts?: number | null;
  lastClockIn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  user: Record<string, unknown> | null;
  isLoading: boolean;
  isManager: boolean;
  userRole: string;
  mounted: boolean;
  userWithRole: Record<string, unknown> | null;
  dbUser: DatabaseUser | null;
  refreshUser: () => void;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { auth0User, dbUser, isLoading, error, refreshUser } = useAuthUser();
  
  // Determine role and manager status based on database role
  const userRole = dbUser?.role === 'MANAGER' ? ROLES.MANAGER : ROLES.WORKER;
  const isManager = dbUser?.role === 'MANAGER';
  
  // Create user with role for compatibility - use database role
  const userWithRole = dbUser ? {
    ...auth0User,
    role: dbUser.role === 'MANAGER' ? ROLES.MANAGER : ROLES.WORKER,
    permissions: dbUser.role === 'MANAGER' ? 
      ['view_all_workers', 'manage_locations', 'view_reports', 'manage_settings'] :
      ['view_own_tasks', 'clock_in_out', 'view_own_reports'],
    isManager: dbUser.role === 'MANAGER'
  } : null;

  const value = {
    user: auth0User,
    isLoading,
    isManager,
    userRole,
    mounted: true, // Always mounted when using this context
    userWithRole,
    dbUser,
    refreshUser,
    error
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
} 