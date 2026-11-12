import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, RolUsuario } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: RolUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('foodtech_user');
    const token = localStorage.getItem('foodtech_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('foodtech_user');
        localStorage.removeItem('foodtech_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<Usuario> => {
    const res = await api.post<{ token: string; usuario: Usuario }>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('foodtech_token', res.token);
    localStorage.setItem('foodtech_user', JSON.stringify(res.usuario));
    setUser(res.usuario);
    return res.usuario;
  };

  const logout = () => {
    localStorage.removeItem('foodtech_token');
    localStorage.removeItem('foodtech_user');
    setUser(null);
  };

  const hasRole = (roles: RolUsuario[]): boolean => {
    if (!user) return false;
    if (user.rol === 'admin') return true;
    return roles.includes(user.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
