import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

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

interface UseAuthUserReturn {
  auth0User: Record<string, unknown> | null;
  dbUser: DatabaseUser | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => void;
}

export function useAuthUser(): UseAuthUserReturn {
  const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useUser();
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateUser = async (auth0User: Record<string, unknown>) => {
    if (!auth0User?.email) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error(`Failed to fetch/create user: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDbUser(data.user);
    } catch (err) {
      console.error('Error fetching/creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    if (auth0User) {
      fetchOrCreateUser(auth0User);
    }
  };

  useEffect(() => {
    if (auth0User && !auth0Loading) {
      fetchOrCreateUser(auth0User);
    } else if (!auth0Loading) {
      setIsLoading(false);
    }
  }, [auth0User, auth0Loading]);

  useEffect(() => {
    if (auth0Error) {
      setError(auth0Error.message);
      setIsLoading(false);
    }
  }, [auth0Error]);

  return {
    auth0User: auth0User as Record<string, unknown> | null,
    dbUser,
    isLoading: auth0Loading || isLoading,
    error,
    refreshUser
  };
} 