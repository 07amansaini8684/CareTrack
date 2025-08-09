'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../contexts/UserContext';

interface UserCreationHandlerProps {
  children: React.ReactNode;
  onUserReady?: (user: any) => void;
}

export default function UserCreationHandler({ children, onUserReady }: UserCreationHandlerProps) {
  const { user, dbUser, isLoading, error, refreshUser } = useUserContext();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (user && !dbUser && !isLoading && !isCreatingUser) {
      setIsCreatingUser(true);
      refreshUser();
    }
  }, [user, dbUser, isLoading, isCreatingUser, refreshUser]);

  useEffect(() => {
    if (dbUser && onUserReady) {
      onUserReady(dbUser);
    }
  }, [dbUser, onUserReady]);

  // Show loading state while creating user
  if (isCreatingUser && !dbUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={refreshUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 