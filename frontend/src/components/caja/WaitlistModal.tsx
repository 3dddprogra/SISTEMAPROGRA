import React, { useState } from 'react';
import { X, UserPlus, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddWaitlist: (data: {
    cliente_nombre: string;
    telefono: string;
    num_personas: number;
    tiempo_estimado_espera?: number;
    notas?: string;
  }) => Promise<void>;
}

export const WaitlistModal: React.FC<Props> = ({ isOpen, onClose, onAddWaitlist }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [personas, setPersonas] = useState(2);
  const [tiempoEspera, setTiempoEspera] = useState(15);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddWaitlist({
        cliente_nombre: nombre,
        telefono,
        num_personas: Number(personas),
        tiempo_estimado_espera: Number(tiempoEspera),
        notas: notas || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-carbon-100 rounded-3xl max-w-md w-full shadow-2xl border border-carbon-200 overflow-hidden">
        <div className="p-6 bg-carbon-50/80 border-b border-carbon-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracota-700 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-carbon-900" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-carbon-900">Añadir a Lista de Espera</h3>
              <p className="text-xs text-carbon-600">Turnos en vivo para recepción</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-carbon-500 hover:text-terracota-400 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-carbon-800 mb-1">Nombre del Cliente *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Laura Vargas"
              className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Teléfono Móvil *</label>
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+591 7..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Nº Personas *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon-800 mb-1">
              Tiempo estimado de espera (minutos)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={tiempoEspera}
              onChange={(e) => setTiempoEspera(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon-800 mb-1">Preferencia / Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Prefiere terraza al aire libre..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
            />
          </div>

          <div className="pt-3 border-t border-carbon-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-suave text-xs py-2 px-4">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primario text-xs py-2 px-4 font-bold">
              {loading ? 'Añadiendo...' : 'Añadir Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
