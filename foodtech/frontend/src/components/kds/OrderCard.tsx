import React from 'react';
import { ChefHat, Check, ArrowRight, XCircle } from 'lucide-react';
import { Pedido, EstadoPedido } from '../../types';
import { TimerBadge } from './TimerBadge';

interface Props {
  pedido: Pedido;
  onAdvanceState: (pedidoId: number, nextState: EstadoPedido) => void;
  loadingId: number | null;
}

export const OrderCard: React.FC<Props> = ({ pedido, onAdvanceState, loadingId }) => {
  const isLoading = loadingId === pedido.id;

  const renderActionButtons = () => {
    switch (pedido.estado) {
      case 'pendiente':
        return (
          <button
            onClick={() => onAdvanceState(pedido.id, 'en_proceso')}
            disabled={isLoading}
            className="btn-celeste w-full py-2.5 text-xs font-bold shadow-sm"
          >
            <ChefHat className="w-4 h-4" />
            <span>Iniciar Preparación</span>
          </button>
        );
      case 'en_proceso':
        return (
          <button
            onClick={() => onAdvanceState(pedido.id, 'terminado')}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-sm text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Marcar Terminado</span>
          </button>
        );
      case 'terminado':
        return (
          <button
            onClick={() => onAdvanceState(pedido.id, 'entregado')}
            disabled={isLoading}
            className="btn-vino w-full py-2.5 text-xs font-bold shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Despachar a Mesa</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-gourmet bg-white border border-beige-200 shadow-warm flex flex-col justify-between hover:border-vino-300 transition-all">
      {/* Header comanda KDS */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-beige-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-vino-950">
                MESA {pedido.numero_mesa || pedido.mesa_id}
              </span>
            </div>
            <span className="text-xs font-semibold text-beige-600">
              #{pedido.codigo} • {new Date(pedido.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <TimerBadge createdAt={pedido.creado_en} />
        </div>

        {/* Lista de platos a preparar */}
        <div className="py-3 space-y-2.5">
          {pedido.detalles?.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-2.5 rounded-xl bg-beige-50/70 border border-beige-200 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-vino-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.cantidad}
                </span>
                <div>
                  <span className="font-bold text-sm text-vino-950 block">
                    {item.nombre_producto}
                  </span>
                  {item.notas && (
                    <span className="inline-block text-[11px] font-semibold text-celeste-700 bg-celeste-50 px-2 py-0.5 rounded border border-celeste-200 mt-1">
                      ⚠️ {item.notas}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notas generales de la comanda */}
        {pedido.notas && (
          <div className="p-2.5 mb-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            <strong>Nota general:</strong> {pedido.notas}
          </div>
        )}
      </div>

      {/* Footer con botones de cambio de estado */}
      <div className="pt-3 border-t border-beige-200 flex items-center gap-2">
        {renderActionButtons()}
      </div>
    </div>
  );
};
