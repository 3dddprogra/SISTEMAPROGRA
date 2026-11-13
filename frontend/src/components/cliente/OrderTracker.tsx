import React from 'react';
import { Clock, CheckCircle2, ChefHat, Bell, Utensils, Receipt } from 'lucide-react';
import { Pedido, EstadoPedido } from '../../types';
import { Badge } from '../common/Badge';

interface Props {
  pedido: Pedido;
}

const STEPS: Array<{ estado: EstadoPedido; label: string; desc: string; icon: React.ElementType }> = [
  { estado: 'pendiente', label: 'Recibido', desc: 'Comanda ingresada al sistema', icon: Bell },
  { estado: 'en_proceso', label: 'En Cocina', desc: 'Preparando ingredientes y cocción', icon: ChefHat },
  { estado: 'terminado', label: 'Plato Listo', desc: 'Listo en barra para entrega', icon: Utensils },
  { estado: 'entregado', label: 'En su Mesa', desc: '¡Buen provecho! Comida servida', icon: CheckCircle2 },
  { estado: 'pagado', label: 'Pagado', desc: 'Cuenta saldada exitosamente', icon: Receipt },
];

export const OrderTracker: React.FC<Props> = ({ pedido }) => {
  const getStepIndex = (estado: EstadoPedido): number => {
    switch (estado) {
      case 'pendiente':
        return 0;
      case 'en_proceso':
        return 1;
      case 'terminado':
        return 2;
      case 'entregado':
        return 3;
      case 'pagado':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(pedido.estado);

  return (
    <div className="card-gourmet bg-gradient-to-br from-carbon-100 via-carbon-50/50 to-ocre-50/30 border-2 border-terracota-200 shadow-warm-lg mb-8">
      {/* Encabezado del seguimiento */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-carbon-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ocre-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-ocre-400">
              Seguimiento de Comanda en Vivo
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-carbon-900 mt-0.5">
            Pedido #{pedido.codigo}
          </h2>
          <span className="text-xs text-carbon-600">
            Mesa #{pedido.numero_mesa || pedido.mesa_id} • Creado a las{' '}
            {new Date(pedido.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="text-right">
          <Badge tipo="pedido" estado={pedido.estado} />
          <div className="text-sm font-bold text-carbon-900 mt-1">
            Total: Bs. {pedido.total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Línea de tiempo visual responsiva */}
      <div className="py-6">
        <div className="relative">
          {/* Barra de progreso de fondo */}
          <div className="absolute top-5 left-4 right-4 h-1 bg-carbon-200 -z-0" />
          {/* Barra de progreso activa */}
          <div
            className="absolute top-5 left-4 h-1 bg-terracota-700 transition-all duration-700 -z-0"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 95}%` }}
          />

          <div className="grid grid-cols-5 relative z-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              let iconBg = 'bg-carbon-100 border-2 border-carbon-300 text-carbon-400';
              if (isCompleted) {
                iconBg = 'bg-terracota-700 text-white border-2 border-terracota-700 shadow-sm';
              } else if (isCurrent) {
                iconBg = 'bg-ocre-600 text-white border-2 border-ocre-600 ring-4 ring-ocre-100 shadow-md animate-pulse';
              }

              return (
                <div key={step.estado} className="flex flex-col items-center text-center px-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-ocre-400'
                        : isCompleted
                        ? 'text-carbon-900'
                        : 'text-carbon-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-carbon-600 mt-0.5 line-clamp-1">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen de platos en la comanda activa */}
      {pedido.detalles && pedido.detalles.length > 0 && (
        <div className="pt-4 border-t border-carbon-200">
          <h4 className="text-xs font-bold uppercase text-carbon-700 tracking-wider mb-2">
            Platos en preparación ({pedido.detalles.length}):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {pedido.detalles.map((d) => (
              <div
                key={d.id || d.producto_id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-carbon-100 border border-carbon-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-terracota-100 text-terracota-400 font-bold flex items-center justify-center text-[11px]">
                    {d.cantidad}x
                  </span>
                  <span className="font-semibold text-carbon-900 truncate max-w-[140px]">
                    {d.nombre_producto}
                  </span>
                </div>
                <span className="text-carbon-700 font-medium">Bs. {d.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
