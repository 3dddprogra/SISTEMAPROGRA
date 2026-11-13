import React from 'react';
import { Categoria } from '../../types';

interface Props {
  categorias: Categoria[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const CategoryFilter: React.FC<Props> = ({ categorias, selectedId, onSelect }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-xs ${
          selectedId === null
            ? 'bg-terracota-700 text-white shadow-sm'
            : 'bg-carbon-100 border border-carbon-200 text-carbon-700 hover:bg-carbon-100 hover:text-terracota-400'
        }`}
      >
        🍽️ Todos los Platos
      </button>

      {categorias.map(cat => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-xs ${
              isSelected
                ? 'bg-terracota-700 text-white shadow-sm'
                : 'bg-carbon-100 border border-carbon-200 text-carbon-700 hover:bg-carbon-100 hover:text-terracota-400'
            }`}
          >
            {cat.nombre}
          </button>
        );
      })}
    </div>
  );
};
