import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RolUsuario } from '../../types';

interface Props {
  /** Roles que pueden entrar (el admin entra siempre). */
  roles: RolUsuario[];
  children: React.ReactElement;
}

/**
 * Protege una pantalla del personal (caja o cocina).
 * - Sin sesión → manda al login.
 * - Con sesión pero con otro rol → manda a la pantalla de su rol.
 * Un cliente que escanea el QR nunca pasa de aquí.
 */
export const ProtectedRoute: React.FC<Props> = ({ roles, children }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return null; // esperando a leer la sesión guardada

  if (!user) return <Navigate to="/login" replace />;

  if (!hasRole(roles)) {
    return <Navigate to={user.rol === 'cocina' ? '/kds' : '/caja'} replace />;
  }

  return children;
};
