import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Users, Check } from 'lucide-react';
import { Mesa } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesas: Mesa[];
  onCreateReservation: (data: {
    mesa_id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email?: string;
    num_personas: number;
    fecha_hora: string;
    notas?: string;
  }) => Promise<void>;
}

export const ReservationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mesas,
  onCreateReservation,
}) => {
  const [mesaId, setMesaId] = useState<number>(mesas[0]?.id || 1);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [personas, setPersonas] = useState(2);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('20:00');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fechaHora = `${fecha} ${hora}:00`;
      await onCreateReservation({
        mesa_id: Number(mesaId),
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        cliente_email: email || undefined,
        num_personas: Number(personas),
        fecha_hora: fechaHora,
        notas: notas || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-carbon-100 rounded-3xl max-w-lg w-full shadow-2xl border border-carbon-200 overflow-hidden">
        <div className="p-6 bg-carbon-50/80 border-b border-carbon-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ocre-600 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-carbon-900">Nueva Reserva de Mesa</h3>
              <p className="text-xs text-carbon-600">Planificación de salón</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-carbon-500 hover:text-terracota-400 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Marcelo Quiroga"
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Mesa a Asignar *</label>
              <select
                value={mesaId}
                onChange={(e) => setMesaId(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600 bg-carbon-100"
              >
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa #{m.numero} ({m.ubicacion} - Cap: {m.capacidad})
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Fecha *</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-carbon-800 mb-1">Hora *</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon-800 mb-1">Notas especiales</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Aniversario, mesa cerca de la ventana..."
              className="w-full text-xs p-3 rounded-xl border border-carbon-300 focus:outline-none focus:ring-1 focus:ring-terracota-600"
            />
          </div>

          <div className="pt-3 border-t border-carbon-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-suave text-xs py-2 px-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-dorado text-xs py-2 px-4 font-bold"
            >
              {loading ? 'Guardando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
