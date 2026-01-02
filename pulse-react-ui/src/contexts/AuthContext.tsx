import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken } from '../api/authService';

// Response type from /api/v1/auth/me endpoint
interface AuthMeResponse {
  email: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  groups?: string[];
  tenantId?: string;
  // Additional fields that might be returned
  id?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthMeResponse | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  // Helper methods for easy access
  userEmail: string | null;
  userRoles: string[];
  userName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if response is successful (200 or 201)
      if (response.status === 200 || response.status === 201) {
        const userData = await response.json() as AuthMeResponse;
        setUser(userData);
      } else {
        // If not successful, clear user
        setUser(null);
        if (response.status === 401 || response.status === 403) {
          // Clear tokens on auth failure
          localStorage.removeItem('user_auth_token');
          localStorage.removeItem('epm_user_auth_token');
          window.dispatchEvent(new Event('authchange'));
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen for auth changes to refresh user
    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener('authchange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authchange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Helper computed values for easy access
  const userEmail = user?.email || null;
  const userRoles = user?.roles || [];
  const userName = user?.name || (user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser: fetchCurrentUser,
        userEmail,
        userRoles,
        userName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
