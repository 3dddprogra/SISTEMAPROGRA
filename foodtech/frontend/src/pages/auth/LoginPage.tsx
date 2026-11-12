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
    <div className="min-h-screen bg-gradient-to-br from-beige-100 via-beige-50 to-vino-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-warm-lg border border-beige-200 overflow-hidden">
        {/* Cabecera Gourmet */}
        <div className="p-8 bg-gradient-to-br from-vino-900 via-vino-800 to-vino-950 text-white text-center border-b-4 border-celeste-500 relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-md">
            <Utensils className="w-8 h-8 text-beige-100" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            FOOD<span className="text-celeste-400 font-sans">TECH</span>
          </h1>
          <p className="text-xs text-beige-200 mt-1">
            Portal de Acceso para Personal de Salón y Cocina
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-beige-800 mb-1.5">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-beige-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@foodtech.bo"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-beige-300 bg-beige-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vino-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-beige-800 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-beige-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-beige-300 bg-beige-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vino-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-vino w-full py-3 text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
          <div className="pt-4 border-t border-beige-200">
            <span className="block text-[11px] font-bold text-beige-600 uppercase tracking-wider mb-2.5 text-center">
              Acceso Rápido de Demostración (1 Clic)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@foodtech.bo', 'Admin1234!')}
                className="p-2.5 rounded-xl border border-beige-300 bg-beige-50/70 hover:bg-vino-50 hover:border-vino-400 text-center transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-vino-700 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-vino-950">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('cajero@foodtech.bo', 'Cajero1234!')}
                className="p-2.5 rounded-xl border border-beige-300 bg-beige-50/70 hover:bg-vino-50 hover:border-vino-400 text-center transition-all"
              >
                <UserCheck className="w-4 h-4 text-celeste-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-vino-950">Cajero</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('cocina@foodtech.bo', 'Cocina1234!')}
                className="p-2.5 rounded-xl border border-beige-300 bg-beige-50/70 hover:bg-vino-50 hover:border-vino-400 text-center transition-all"
              >
                <ChefHat className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-vino-950">Cocina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
