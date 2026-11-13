import React from 'react';
import { EstadoPedido, EstadoMesa } from '../../types';

interface BadgeProps {
  tipo: 'pedido' | 'mesa' | 'reserva';
  estado: EstadoPedido | EstadoMesa | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ tipo, estado, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wider';

  if (tipo === 'pedido') {
    switch (estado) {
      case 'pendiente':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Pendiente
          </span>
        );
      case 'en_proceso':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-celeste-100 text-celeste-800 border border-celeste-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-celeste-500 animate-spin"></span>
            En Cocina
          </span>
        );
      case 'terminado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Listo p/ Entregar
          </span>
        );
      case 'entregado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-blue-100 text-blue-900 border border-blue-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Entregado
          </span>
        );
      case 'pagado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-vino-100 text-vino-900 border border-vino-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-vino-700"></span>
            Pagado
          </span>
        );
      case 'cancelado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-gray-100 text-gray-700 border border-gray-300 ${sizeClasses}`}>
            Cancelado
          </span>
        );
    }
  }

  if (tipo === 'mesa') {
    switch (estado) {
      case 'disponible':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Disponible
          </span>
        );
      case 'ocupada':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-vino-100 text-vino-900 border border-vino-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-vino-700"></span>
            Ocupada
          </span>
        );
      case 'reservada':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-celeste-100 text-celeste-800 border border-celeste-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-celeste-600"></span>
            Reservada
          </span>
        );
      case 'inactiva':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200 ${sizeClasses}`}>
            Inactiva
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-beige-200 text-beige-900 ${sizeClasses}`}>
      {estado}
    </span>
  );
};
