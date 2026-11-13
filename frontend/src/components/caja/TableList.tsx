import React, { useState } from 'react';
import { Search, Filter, Receipt, Users, Edit3 } from 'lucide-react';
import { Mesa, Pedido, EstadoMesa } from '../../types';
import { Badge } from '../common/Badge';

interface Props {
  mesas: Mesa[];
  pedidosActivos: Map<number, Pedido>;
  onSelectMesa: (mesa: Mesa, pedido?: Pedido) => void;
  onUpdateEstadoMesa: (mesaId: number, estado: EstadoMesa) => void;
}

export const TableList: React.FC<Props> = ({
  mesas,
  pedidosActivos,
  onSelectMesa,
  onUpdateEstadoMesa,
}) => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const filtered = mesas.filter((m) => {
    const matchesSearch =
      m.numero.toString().includes(search) ||
      m.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || m.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="card-gourmet bg-white space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-beige-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-beige-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por mesa o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-beige-300 bg-beige-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-vino-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-beige-600" />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-beige-300 bg-beige-50/50 focus:outline-none focus:ring-1 focus:ring-vino-600 font-medium"
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupada">Ocupadas</option>
            <option value="reservada">Reservadas</option>
          </select>
        </div>
      </div>

      {/* Tabla detallada del salón */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-beige-900">
          <thead className="bg-beige-100/70 text-beige-700 font-bold uppercase tracking-wider text-[11px] border-b border-beige-200">
            <tr>
              <th className="py-3 px-4">Mesa</th>
              <th className="py-3 px-4">Ubicación</th>
              <th className="py-3 px-4">Capacidad</th>
              <th className="py-3 px-4">Estado Salón</th>
              <th className="py-3 px-4">Comanda Activa</th>
              <th className="py-3 px-4">Total Consumo</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-100">
            {filtered.map((mesa) => {
              const pedido = pedidosActivos.get(mesa.id);
              return (
                <tr key={mesa.id} className="hover:bg-beige-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-sm text-vino-950">
                    Mesa #{mesa.numero}
                  </td>
                  <td className="py-3.5 px-4 text-beige-700">{mesa.ubicacion}</td>
                  <td className="py-3.5 px-4 flex items-center gap-1 text-beige-600">
                    <Users className="w-3.5 h-3.5 text-beige-400" />
                    <span>{mesa.capacidad} personas</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tipo="mesa" estado={mesa.estado} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    {pedido ? (
                      <span className="text-vino-800 font-bold">#{pedido.codigo}</span>
                    ) : (
                      <span className="text-beige-400">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {pedido ? (
                      <span className="text-vino-700">Bs. {pedido.total.toFixed(2)}</span>
                    ) : (
                      <span className="text-beige-400">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {pedido ? (
                      <button
                        onClick={() => onSelectMesa(mesa, pedido)}
                        className="btn-vino text-[11px] py-1.5 px-3"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Cobrar
                      </button>
                    ) : (
                      <select
                        value={mesa.estado}
                        onChange={(e) => onUpdateEstadoMesa(mesa.id, e.target.value as EstadoMesa)}
                        className="text-[11px] py-1 px-2 border border-beige-300 rounded-lg bg-white"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="ocupada">Ocupada</option>
                        <option value="reservada">Reservada</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
