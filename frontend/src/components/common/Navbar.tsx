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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-rojo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Marca */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo oficial de Nori Pollo: frontend/public/menu/logo-rotulo.jpg */}
            <img
              src="/menu/logo-rotulo.jpg"
              alt="Nori Pollo"
              className="h-11 w-auto rounded-lg border border-carbon-200 shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-carbon-600 uppercase leading-tight">
              Pedidos<br />en línea
            </span>
          </Link>

          {/* Estado de Conexión WebSocket */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-100 border border-carbon-200 text-xs">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-verde-500 animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5 text-verde-400" />
                <span className="text-carbon-800 font-medium">En vivo</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amarillo-500"></span>
                <WifiOff className="w-3.5 h-3.5 text-amarillo-400" />
                <span className="text-amarillo-400 font-medium">Reconectando...</span>
              </>
            )}
          </div>

          {/* Enlaces de Navegación Escritorio */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/m/1"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/m/1')
                  ? 'bg-rojo-50 text-rojo-400 font-semibold shadow-xs'
                  : 'text-carbon-700 hover:text-rojo-400 hover:bg-carbon-100'
              }`}
            >
              <QrCode className="w-4 h-4 text-rojo-400" />
              Menú QR (Mesa)
            </Link>

            <Link
              to="/kds"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/kds')
                  ? 'bg-amarillo-50 text-amarillo-400 font-semibold shadow-xs'
                  : 'text-carbon-700 hover:text-amarillo-400 hover:bg-carbon-100'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amarillo-400" />
              Cocina (KDS)
            </Link>

            <Link
              to="/caja"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/caja')
                  ? 'bg-rojo-700 text-white font-semibold shadow-sm'
                  : 'text-carbon-700 hover:text-rojo-400 hover:bg-carbon-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Caja & Salón
            </Link>
          </nav>

          {/* Sección Usuario / Login */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-carbon-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-carbon-900">{user.nombre}</div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rojo-100 text-rojo-400">
                    {user.rol}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 text-carbon-600 hover:text-rojo-400 hover:bg-rojo-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-contorno text-xs py-2 px-3.5"
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
              className="p-2 text-carbon-700 hover:text-rojo-400 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-carbon-200 bg-carbon-100 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/m/1"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-carbon-900 hover:bg-carbon-100"
          >
            <QrCode className="w-5 h-5 text-rojo-400" />
            Menú QR Clientes
          </Link>
          <Link
            to="/kds"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-carbon-900 hover:bg-carbon-100"
          >
            <ChefHat className="w-5 h-5 text-amarillo-400" />
            Cocina (KDS)
          </Link>
          <Link
            to="/caja"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-carbon-900 hover:bg-carbon-100"
          >
            <LayoutDashboard className="w-5 h-5 text-rojo-400" />
            Caja & Salón
          </Link>

          <div className="pt-3 border-t border-carbon-200">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-carbon-900 text-sm">{user.nombre}</div>
                  <div className="text-xs text-carbon-600">{user.email} ({user.rol})</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-contorno text-xs py-1.5 px-3"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primario w-full text-center text-sm"
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
