import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    try {
      const user = await login(targetEmail, targetPass);
      if (user.rol === 'cocina') {
        navigate('/kds');
      } else {
        navigate('/caja');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(undefined, demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-carbon-100 via-carbon-50 to-terracota-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-carbon-100 rounded-3xl shadow-warm-lg border border-carbon-200 overflow-hidden">
        {/* Cabecera Gourmet */}
        <div className="p-8 bg-gradient-to-br from-carbon-100 via-terracota-950 to-carbon-100 text-white text-center border-b border-ocre-600/60 relative">
          <div className="w-16 h-16 rounded-2xl bg-carbon-100/10 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-md">
            <Utensils className="w-8 h-8 text-carbon-900" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            FOOD<span className="text-ocre-400 font-sans">TECH</span>
          </h1>
          <p className="text-xs text-carbon-900 mt-1">
            Portal de Acceso para Personal de Salón y Cocina
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-kantuta-50 border border-kantuta-200 text-xs text-kantuta-400 font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1.5">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-carbon-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@foodtech.bo"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-carbon-300 bg-carbon-50/50 focus:bg-carbon-100 focus:outline-none focus:ring-2 focus:ring-terracota-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-carbon-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-carbon-300 bg-carbon-50/50 focus:bg-carbon-100 focus:outline-none focus:ring-2 focus:ring-terracota-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primario w-full py-3 text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Iniciando Sesión...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Accesos Rápidos de Prueba (Demo UNICEN) */}
          <div className="pt-4 border-t border-carbon-200">
            <span className="block text-[11px] font-bold text-carbon-600 uppercase tracking-wider mb-2.5 text-center">
              Acceso Rápido de Demostración (1 Clic)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@foodtech.bo', 'Admin1234!')}
                className="p-2.5 rounded-xl border border-carbon-300 bg-carbon-50/70 hover:bg-terracota-50 hover:border-terracota-400 text-center transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-terracota-400 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-carbon-900">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('cajero@foodtech.bo', 'Cajero1234!')}
                className="p-2.5 rounded-xl border border-carbon-300 bg-carbon-50/70 hover:bg-terracota-50 hover:border-terracota-400 text-center transition-all"
              >
                <UserCheck className="w-4 h-4 text-ocre-400 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-carbon-900">Cajero</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('cocina@foodtech.bo', 'Cocina1234!')}
                className="p-2.5 rounded-xl border border-carbon-300 bg-carbon-50/70 hover:bg-terracota-50 hover:border-terracota-400 text-center transition-all"
              >
                <ChefHat className="w-4 h-4 text-verde-400 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-carbon-900">Cocina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
