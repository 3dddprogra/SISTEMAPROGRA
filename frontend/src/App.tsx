import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { PlatoImagen } from './components/common/PlatoImagen';
import { ClienteMenu } from './pages/cliente/ClienteMenu';
import { KdsBoard } from './pages/kds/KdsBoard';
import { CajaDashboard } from './pages/caja/CajaDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { api } from './services/api';
import { Producto } from './types';
import {
  QrCode, ChefHat, LayoutDashboard, ArrowRight, Zap, Receipt, CalendarClock,
  Mountain, Wheat, Flame, MapPin, Phone, Clock,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// LANDING PÚBLICA
// Cada sección es un bloque <section>. Para quitar una sección,
// borra su bloque; para cambiar colores, usa las clases de
// tailwind.config.js (terracota, ocre, carbon, verde...).
// ─────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  // Platos destacados: datos REALES de la API (los primeros disponibles)
  const [destacados, setDestacados] = useState<Producto[]>([]);
  useEffect(() => {
    api
      .get<Producto[]>('/productos/disponibles')
      .then((lista) => setDestacados(lista.slice(0, 4)))
      .catch(() => setDestacados([]));
  }, []);

  const ventajas = [
    { icono: QrCode, titulo: 'Menú digital QR', texto: 'Desde el celular, en la mesa' },
    { icono: Zap, titulo: 'Pedidos en tiempo real', texto: 'Cocina y salón sincronizados' },
    { icono: Receipt, titulo: 'Cobro en caja', texto: 'Cuenta clara y facturación' },
    { icono: CalendarClock, titulo: 'Reservas y espera', texto: 'Gestión de mesas y turnos' },
  ];

  return (
    <div className="min-h-screen bg-carbon-50">
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden border-b border-carbon-200">
        <div className="absolute inset-0 bg-gradient-to-br from-carbon-50 via-carbon-100 to-terracota-950/60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-ocre-400">
              Gastronomía boliviana de autor
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight text-carbon-900">
              La tradición boliviana,{' '}
              <span className="italic text-ocre-400">ahora en la era digital</span>
            </h1>
            <p className="text-carbon-700 max-w-md leading-relaxed">
              Sabores de nuestra tierra con una experiencia gastronómica inteligente: pide desde tu
              mesa, sigue tu pedido en vivo y paga en caja.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/m/1" className="btn-primario px-6 py-3">
                Ver Menú <ArrowRight className="w-4 h-4" />
              </Link>
              {/* "Reservar Mesa" lleva a la sección de Contacto (no hay reserva pública en el sistema) */}
              <a href="#contacto" className="btn-contorno px-6 py-3">
                <CalendarClock className="w-4 h-4" /> Reservar Mesa
              </a>
            </div>
          </div>

          {/* Foto principal: coloca tu imagen en frontend/public/platos/hero.jpg */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-terracota-600/10 blur-2xl" />
            <PlatoImagen
              src="/platos/hero.jpg"
              alt="Plato principal de la casa"
              className="relative w-full aspect-[4/3] object-cover rounded-modal border border-carbon-200 shadow-warm-lg"
            />
          </div>
        </div>
        <div className="franja-andina" />
      </section>

      {/* ───── VENTAJAS ───── */}
      <section className="border-b border-carbon-200 bg-carbon-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {ventajas.map(({ icono: Icono, titulo, texto }) => (
            <div key={titulo} className="flex items-start gap-3">
              <Icono className="w-6 h-6 text-ocre-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-carbon-900">{titulo}</p>
                <p className="text-xs text-carbon-600">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── PLATOS DESTACADOS (datos reales de la API) ───── */}
      {destacados.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-serif text-3xl font-bold text-carbon-900">Nuestros Platos Destacados</h2>
            <Link to="/m/1" className="text-sm font-semibold text-ocre-400 hover:text-ocre-500 flex items-center gap-1">
              Ver todo el menú <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destacados.map((p) => (
              <article key={p.id} className="card-gourmet !p-3 flex flex-col">
                <PlatoImagen
                  src={p.imagen_url}
                  alt={p.nombre}
                  className="w-full aspect-square object-cover rounded-xl mb-3"
                />
                <h3 className="font-serif text-base font-bold text-carbon-900 line-clamp-2">{p.nombre}</h3>
                <p className="text-sm font-bold text-ocre-400 mt-auto pt-2">Bs. {Number(p.precio).toFixed(2)}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ───── IDENTIDAD ───── */}
      <section className="bg-carbon-100 border-y border-carbon-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-3 gap-8">
          {[
            { icono: Mountain, titulo: 'Nuestra tierra', texto: 'Cocina con raíces bolivianas, inspirada en los valles y el altiplano.' },
            { icono: Wheat, titulo: 'Ingredientes locales', texto: 'Maíz, papa, quinua y ají: los sabores que nos identifican.' },
            { icono: Flame, titulo: 'Fusión gourmet', texto: 'Recetas tradicionales presentadas con técnica contemporánea.' },
          ].map(({ icono: Icono, titulo, texto }) => (
            <div key={titulo} className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-terracota-100 text-terracota-400 flex items-center justify-center">
                <Icono className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-carbon-900">{titulo}</h3>
              <p className="text-sm text-carbon-700">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── ACCESO A LOS MÓDULOS DEL SISTEMA ───── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-serif text-3xl font-bold text-carbon-900 text-center mb-1">Acceso al sistema</h2>
        <p className="text-sm text-carbon-600 text-center mb-8">Elige el módulo que quieres usar</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-gourmet flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracota-100 text-terracota-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-carbon-900 mb-2">1. Menú QR Clientes</h3>
              <p className="text-xs text-carbon-700 leading-relaxed mb-4">
                Carta digital para el comensal: arma la comanda, agrega notas y sigue el estado de preparación en vivo.
              </p>
            </div>
            <div className="pt-4 border-t border-carbon-200 space-y-2">
              <span className="block text-[11px] font-bold text-carbon-600 uppercase">Acceso rápido por mesa:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((m) => (
                  <Link
                    key={m}
                    to={`/m/${m}`}
                    className="p-2 text-center rounded-xl bg-carbon-50 hover:bg-terracota-700 hover:text-white border border-carbon-200 text-xs font-bold text-carbon-900 transition-colors"
                  >
                    Mesa {m}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card-gourmet flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-ocre-100 text-ocre-400 flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-carbon-900 mb-2">2. Pantalla Cocina (KDS)</h3>
              <p className="text-xs text-carbon-700 leading-relaxed mb-4">
                Tablero de 3 columnas para cocina, con alertas de tiempo de espera y aviso sonoro instantáneo.
              </p>
            </div>
            <div className="pt-4 border-t border-carbon-200">
              <Link to="/kds" className="btn-dorado w-full py-2.5 text-xs">
                Abrir KDS de Cocina <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="card-gourmet flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracota-600 text-white flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-carbon-900 mb-2">3. Panel Caja &amp; Salón</h3>
              <p className="text-xs text-carbon-700 leading-relaxed mb-4">
                Mapa de mesas, cobro de cuentas, facturación, reservas anticipadas y lista de espera.
              </p>
            </div>
            <div className="pt-4 border-t border-carbon-200">
              <Link to="/caja" className="btn-primario w-full py-2.5 text-xs">
                Abrir Panel de Caja <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CONTACTO (datos por definir: no inventamos información real) ───── */}
      <section id="contacto" className="bg-carbon-100 border-t border-carbon-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-serif text-3xl font-bold text-carbon-900 mb-6">Contacto y reservas</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-carbon-700">
            <p className="flex items-start gap-3"><MapPin className="w-5 h-5 text-ocre-400 flex-shrink-0" /> Dirección: por definir</p>
            <p className="flex items-start gap-3"><Phone className="w-5 h-5 text-ocre-400 flex-shrink-0" /> Teléfono / WhatsApp: por definir</p>
            <p className="flex items-start gap-3"><Clock className="w-5 h-5 text-ocre-400 flex-shrink-0" /> Horarios: por definir</p>
          </div>
          <p className="text-xs text-carbon-600 mt-4">
            Las reservas se registran en caja. Reemplaza estos datos cuando el restaurante los defina.
          </p>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-carbon-200 bg-carbon-50">
        <div className="franja-andina" />
        <p className="text-center text-xs text-carbon-600 py-6">
          FoodTech · Gastronomía boliviana y tecnología · UNICEN Cochabamba
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-carbon-50">
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
