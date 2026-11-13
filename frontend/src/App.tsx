import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ClienteMenu } from './pages/cliente/ClienteMenu';
import { KdsBoard } from './pages/kds/KdsBoard';
import { CajaDashboard } from './pages/caja/CajaDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { QrCode, ChefHat, LayoutDashboard, Utensils, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-beige-50">
      {/* Hero Gourmet en Vino, Celeste y Beige */}
      <section className="bg-gradient-to-br from-vino-950 via-vino-900 to-vino-800 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b-4 border-celeste-500">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-vino-700/80 border border-vino-500 text-xs font-bold uppercase tracking-wider text-beige-100">
            UNICEN • Cochabamba • Innovación Digital e IA
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white">
            FOOD<span className="text-celeste-400 font-sans">TECH</span>
          </h1>
          <p className="text-sm sm:text-lg text-beige-200 max-w-2xl mx-auto font-light leading-relaxed">
            Sistema integral de gestión de restaurantes en tiempo real. Eliminando comandas en papel mediante WebSockets, KDS inteligente y panel dual de salón.
          </p>
        </div>
      </section>

      {/* Módulos Principales */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div>
          <h2 className="font-serif text-2xl font-bold text-vino-950 mb-2 text-center">
            Acceso a los Tres Módulos del Ecosistema
          </h2>
          <p className="text-xs text-beige-600 text-center mb-8">
            Seleccione el rol o experiencia que desea evaluar en tiempo real
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjeta Módulo Cliente QR */}
            <div className="card-gourmet bg-white flex flex-col justify-between hover:border-vino-400">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-vino-100 text-vino-800 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-vino-950 mb-2">
                  1. Menú QR Clientes
                </h3>
                <p className="text-xs text-beige-700 leading-relaxed mb-4">
                  Carta digital interactiva para el comensal. Permite armar la comanda, registrar notas especiales y seguir en vivo el estado de preparación.
                </p>
              </div>

              <div className="pt-4 border-t border-beige-200 space-y-2">
                <span className="block text-[11px] font-bold text-beige-600 uppercase">
                  Acceso rápido por mesa:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
                    <Link
                      key={m}
                      to={`/m/${m}`}
                      className="p-2 text-center rounded-xl bg-beige-50 hover:bg-vino-700 hover:text-white border border-beige-300 text-xs font-bold text-vino-950 transition-colors"
                    >
                      Mesa {m}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Tarjeta Módulo KDS Cocina */}
            <div className="card-gourmet bg-white flex flex-col justify-between hover:border-celeste-400">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-celeste-100 text-celeste-800 flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-vino-950 mb-2">
                  2. Pantalla Cocina (KDS)
                </h3>
                <p className="text-xs text-beige-700 leading-relaxed mb-4">
                  Tablero Kanban de 3 columnas para el personal de cocina. Alertas cromáticas de tiempo de espera y notificación sonora instantánea con Socket.io.
                </p>
              </div>

              <div className="pt-4 border-t border-beige-200">
                <Link
                  to="/kds"
                  className="btn-celeste w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>Abrir KDS de Cocina</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tarjeta Módulo Caja & Salón */}
            <div className="card-gourmet bg-white flex flex-col justify-between hover:border-vino-700">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-vino-700 text-white flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-6 h-6 text-beige-100" />
                </div>
                <h3 className="font-serif text-xl font-bold text-vino-950 mb-2">
                  3. Panel Caja & Salón
                </h3>
                <p className="text-xs text-beige-700 leading-relaxed mb-4">
                  Control global del salón con mapa interactivo de mesas, cobro de cuentas, facturación, reservas anticipadas y lista de espera de comensales.
                </p>
              </div>

              <div className="pt-4 border-t border-beige-200">
                <Link
                  to="/caja"
                  className="btn-vino w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>Abrir Panel de Caja</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-beige-50">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/m/:mesaId" element={<ClienteMenu />} />
              <Route path="/kds" element={<KdsBoard />} />
              <Route path="/caja" element={<CajaDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
