import React from 'react';
import { Users, Clock, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { Mesa, Pedido } from '../../types';
import { Badge } from '../common/Badge';

interface Props {
  mesas: Mesa[];
  pedidosActivos: Map<number, Pedido>;
  onSelectMesa: (mesa: Mesa, pedido?: Pedido) => void;
}

export const FloorMap: React.FC<Props> = ({ mesas, pedidosActivos, onSelectMesa }) => {
  return (
    <div className="space-y-6">
      {/* Leyenda de estados */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-carbon-100 border border-carbon-200 text-xs">
        <span className="font-bold text-carbon-700 uppercase tracking-wider">Leyenda del Salón:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-verde-500"></span>
          <span className="font-semibold text-carbon-800">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-terracota-700"></span>
          <span className="font-semibold text-carbon-900">Ocupada con Comanda</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-ocre-600"></span>
          <span className="font-semibold text-ocre-400">Reservada</span>
        </div>
      </div>

      {/* Cuadrícula interactiva de mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mesas.map((mesa) => {
          const pedidoActivo = pedidosActivos.get(mesa.id);
          const isOcupada = mesa.estado === 'ocupada';
          const isReservada = mesa.estado === 'reservada';

          let cardBorder = 'border-carbon-200 hover:border-verde-400 bg-carbon-100';
          if (isOcupada) {
            cardBorder = 'border-terracota-400 bg-gradient-to-br from-carbon-100 to-terracota-50/40 shadow-warm';
          } else if (isReservada) {
            cardBorder = 'border-ocre-400 bg-gradient-to-br from-carbon-100 to-ocre-50/40';
          }

          return (
            <div
              key={mesa.id}
              onClick={() => onSelectMesa(mesa, pedidoActivo)}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between min-h-[170px] ${cardBorder}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-base ${
                        isOcupada
                          ? 'bg-terracota-700 text-white'
                          : isReservada
                          ? 'bg-ocre-600 text-white'
                          : 'bg-verde-100 text-verde-400'
                      }`}
                    >
                      {mesa.numero}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-carbon-900 leading-tight">Mesa {mesa.numero}</h4>
                      <span className="text-[11px] text-carbon-600">{mesa.ubicacion}</span>
                    </div>
                  </div>
                  <Badge tipo="mesa" estado={mesa.estado} size="sm" />
                </div>

                {/* Info de Ocupación / Comanda Activa */}
                {isOcupada && pedidoActivo && (
                  <div className="mt-3 p-2.5 rounded-xl bg-carbon-100/90 border border-terracota-200/60 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-carbon-900 truncate">
                        #{pedidoActivo.codigo}
                      </span>
                      <span className="font-bold text-terracota-400">
                        Bs. {pedidoActivo.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-carbon-600">
                      <span>Platos: {pedidoActivo.detalles?.length || 0}</span>
                      <span className="capitalize font-medium text-ocre-400">
                        {pedidoActivo.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pie de la tarjeta con capacidad y acción rápida */}
              <div className="pt-3 border-t border-carbon-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-carbon-600">
                  <Users className="w-3.5 h-3.5 text-carbon-500" />
                  <span>Cap. {mesa.capacidad} pers.</span>
                </span>

                {isOcupada ? (
                  <button className="text-[11px] font-bold text-terracota-400 hover:text-carbon-900 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Cobrar</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-verde-400">Disponible</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
