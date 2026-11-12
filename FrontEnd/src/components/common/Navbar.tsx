import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, ChefHat, LayoutDashboard, QrCode, LogOut, LogIn, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/caja' && location.pathname.startsWith('/caja')) return true;
    if (path === '/kds' && location.pathname.startsWith('/kds')) return true;
    if (path === '/m/1' && location.pathname.startsWith('/m/')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-beige-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Marca */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-vino-700 flex items-center justify-center text-white shadow-md group-hover:bg-vino-800 transition-colors">
              <Utensils className="w-5 h-5 text-beige-100" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-vino-900 group-hover:text-vino-700 transition-colors">
                FOOD<span className="text-celeste-600 font-sans">TECH</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-beige-600 uppercase -mt-1">
                Restaurante Inteligente
              </span>
            </div>
          </Link>

          {/* Estado de Conexión WebSocket */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-beige-100 border border-beige-200 text-xs">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-beige-800 font-medium">En vivo</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-800 font-medium">Reconectando...</span>
              </>
            )}
          </div>

          {/* Enlaces de Navegación Escritorio */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/m/1"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/m/1')
                  ? 'bg-vino-50 text-vino-800 font-semibold shadow-xs'
                  : 'text-beige-700 hover:text-vino-800 hover:bg-beige-100'
              }`}
            >
              <QrCode className="w-4 h-4 text-vino-600" />
              Menú QR (Mesa)
            </Link>

            <Link
              to="/kds"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/kds')
                  ? 'bg-celeste-50 text-celeste-800 font-semibold shadow-xs'
                  : 'text-beige-700 hover:text-celeste-800 hover:bg-beige-100'
              }`}
            >
              <ChefHat className="w-4 h-4 text-celeste-600" />
              Cocina (KDS)
            </Link>

            <Link
              to="/caja"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/caja')
                  ? 'bg-vino-700 text-white font-semibold shadow-sm'
                  : 'text-beige-700 hover:text-vino-800 hover:bg-beige-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Caja & Salón
            </Link>
          </nav>

          {/* Sección Usuario / Login */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-beige-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-vino-950">{user.nombre}</div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-vino-100 text-vino-800">
                    {user.rol}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 text-beige-600 hover:text-vino-800 hover:bg-vino-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-outline-vino text-xs py-2 px-3.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Ingreso Personal
              </Link>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-beige-700 hover:text-vino-800 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-beige-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/m/1"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-beige-900 hover:bg-beige-100"
          >
            <QrCode className="w-5 h-5 text-vino-700" />
            Menú QR Clientes
          </Link>
          <Link
            to="/kds"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-beige-900 hover:bg-beige-100"
          >
            <ChefHat className="w-5 h-5 text-celeste-600" />
            Cocina (KDS)
          </Link>
          <Link
            to="/caja"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-beige-900 hover:bg-beige-100"
          >
            <LayoutDashboard className="w-5 h-5 text-vino-700" />
            Caja & Salón
          </Link>

          <div className="pt-3 border-t border-beige-200">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-vino-950 text-sm">{user.nombre}</div>
                  <div className="text-xs text-beige-600">{user.email} ({user.rol})</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-outline-vino text-xs py-1.5 px-3"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-vino w-full text-center text-sm"
              >
                Ingreso Personal Staff
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
