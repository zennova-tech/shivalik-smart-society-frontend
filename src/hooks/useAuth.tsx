import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Keep as string for PrivateRoute compatibility
  userRoles?: string[]; // Optional array for flexibility
  societyId?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if mock mode is enabled
const isMockModeEnabled = () => {
    return import.meta.env.VITE_MOCK_AUTH === 'true' || localStorage.getItem('MOCK_AUTH') === 'true';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('userInfo');

    // Check if mock mode is enabled and bypass login
    if (isMockModeEnabled() && (!token || !userData)) {
      // Auto-login with mock user data
      const mockUser: User = {
        id: 'mock-user-id-123',
        name: 'Mock Admin User',
        email: 'admin@example.com',
        phone: '1234567890',
        role: 'SuperAdmin',
        userRoles: ['SuperAdmin'],
        avatar: ''
      };
      const mockToken = 'mock-access-token-' + Date.now();
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('userInfo', JSON.stringify({
        id: mockUser.id,
        firstName: 'Mock',
        lastName: 'Admin',
        email: mockUser.email,
        phone: mockUser.phone,
        userRoles: mockUser.userRoles,
        avatar: mockUser.avatar,
        accessToken: mockToken
      }));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      return;
    }

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Transform userRoles to role if needed, but prioritize role if it exists
        const roleValue = parsedUser.role || parsedUser.userRoles?.join(',') || parsedUser.userRoles?.[0] || '';
        const transformedUser: User = {
          id: parsedUser.id || '',
          name: parsedUser.firstName + ' ' + parsedUser.lastName || parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          role: roleValue,
          userRoles: parsedUser.userRoles || parsedUser.roles || (roleValue ? [roleValue] : []),
          avatar: parsedUser.avatar || ''
        };
        setUser(transformedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivePath');
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};