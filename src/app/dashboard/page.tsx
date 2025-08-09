'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import UserCreationHandler from '../components/UserCreationHandler';
import { useUserContext } from '../contexts/UserContext';

export default function Dashboard() {
  const { user, isLoading, isManager, dbUser } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (user && dbUser && !isLoading) {
      // Redirect based on role
      if (isManager) {
        router.push('/dashboard/manager');
      } else {
        router.push('/dashboard/worker');
      }
    }
  }, [user, dbUser, isLoading, router, isManager]);

  if (!user || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <UserCreationHandler>
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
    </UserCreationHandler>
  );
} 