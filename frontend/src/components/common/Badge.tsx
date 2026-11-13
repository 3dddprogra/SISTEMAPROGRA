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
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-ocre-100 text-ocre-400 border border-ocre-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-ocre-500 animate-pulse"></span>
            Pendiente
          </span>
        );
      case 'en_proceso':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-ocre-100 text-ocre-400 border border-ocre-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-ocre-500 animate-spin"></span>
            En Cocina
          </span>
        );
      case 'terminado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-verde-100 text-verde-400 border border-verde-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-verde-500"></span>
            Listo p/ Entregar
          </span>
        );
      case 'entregado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-azul-100 text-azul-400 border border-azul-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-azul-600"></span>
            Entregado
          </span>
        );
      case 'pagado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-terracota-100 text-carbon-900 border border-terracota-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-terracota-700"></span>
            Pagado
          </span>
        );
      case 'cancelado':
        return (
          <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-carbon-100 text-carbon-700 border border-carbon-300 ${sizeClasses}`}>
            Cancelado
          </span>
        );
    }
  }

  if (tipo === 'mesa') {
    switch (estado) {
      case 'disponible':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-verde-100 text-verde-400 border border-verde-200 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-verde-500"></span>
            Disponible
          </span>
        );
      case 'ocupada':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-terracota-100 text-carbon-900 border border-terracota-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-terracota-700"></span>
            Ocupada
          </span>
        );
      case 'reservada':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-ocre-100 text-ocre-400 border border-ocre-300 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-ocre-600"></span>
            Reservada
          </span>
        );
      case 'inactiva':
        return (
          <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-carbon-100 text-carbon-600 border border-carbon-200 ${sizeClasses}`}>
            Inactiva
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-carbon-200 text-carbon-900 ${sizeClasses}`}>
      {estado}
    </span>
  );
};
