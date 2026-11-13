import React, { useState } from 'react';
import { Clock, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Producto } from '../../types';
import { PlatoImagen } from '../common/PlatoImagen';

interface Props {
  producto: Producto;
  onAddToCart: (producto: Producto, cantidad: number, notas?: string) => void;
}

export const ProductCard: React.FC<Props> = ({ producto, onAddToCart }) => {
  const [cantidad, setCantidad] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notas, setNotas] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(producto, cantidad, notas.trim() ? notas.trim() : undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
    setCantidad(1);
    setNotas('');
    setShowNotes(false);
  };

  return (
    <div className="card-gourmet flex flex-col justify-between group overflow-hidden relative border border-carbon-200/80">
      {/* Indicador de disponibilidad */}
      {!producto.disponible && (
        <div className="absolute inset-0 bg-carbon-100/80 backdrop-blur-xs z-10 flex items-center justify-center">
          <span className="bg-kantuta-100 text-kantuta-400 border border-kantuta-300 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide">
            Agotado por el momento
          </span>
        </div>
      )}

      <div>
        {/* Imagen del plato con ratio estilizado */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-carbon-100 mb-4">
          <PlatoImagen src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-ocre-400" />
            <span>~{producto.tiempo_estimado_min} min</span>
          </div>
          <div className="absolute top-2 right-2 bg-terracota-700 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-md">
            Bs. {producto.precio.toFixed(2)}
          </div>
        </div>

        {/* Datos del producto */}
        <div className="mb-3">
          <span className="text-[11px] font-semibold tracking-wider text-ocre-400 uppercase">
            {producto.categoria_nombre || 'Especialidad'}
          </span>
          <h3 className="font-serif text-lg font-bold text-carbon-900 line-clamp-1 mt-0.5">
            {producto.nombre}
          </h3>
          <p className="text-carbon-700 text-xs line-clamp-2 mt-1 leading-relaxed">
            {producto.descripcion}
          </p>
        </div>

        {/* Input notas opcionales */}
        {showNotes && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Instrucciones especiales (ej: sin picante)..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-carbon-300 bg-carbon-50/50 focus:bg-carbon-100 focus:outline-none focus:ring-1 focus:ring-terracota-500"
            />
          </div>
        )}
      </div>

      {/* Controles de compra */}
      <div className="pt-3 border-t border-carbon-100 flex items-center justify-between gap-2">
        <div className="flex items-center border border-carbon-200 rounded-xl bg-carbon-50/80 p-0.5">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-7 h-7 flex items-center justify-center text-carbon-700 hover:text-terracota-400 hover:bg-carbon-100 rounded-lg transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 text-center font-bold text-sm text-carbon-900">{cantidad}</span>
          <button
            onClick={() => setCantidad(cantidad + 1)}
            className="w-7 h-7 flex items-center justify-center text-carbon-700 hover:text-terracota-400 hover:bg-carbon-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-[11px] text-carbon-600 hover:text-terracota-400 underline px-1"
          >
            {showNotes ? 'Ocultar' : '+ Nota'}
          </button>

          <button
            onClick={handleAdd}
            disabled={!producto.disponible}
            className={`btn-primario text-xs py-2 px-3 flex-1 max-w-[130px] ${
              addedAnimation ? 'bg-verde-600 hover:bg-verde-600' : ''
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>¡Listo!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Pedir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
