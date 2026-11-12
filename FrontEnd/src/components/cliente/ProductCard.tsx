import React, { useState } from 'react';
import { Clock, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Producto } from '../../types';

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
    <div className="card-gourmet flex flex-col justify-between group overflow-hidden relative border border-beige-200/80">
      {/* Indicador de disponibilidad */}
      {!producto.disponible && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex items-center justify-center">
          <span className="bg-red-100 text-red-800 border border-red-300 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide">
            Agotado por el momento
          </span>
        </div>
      )}

      <div>
        {/* Imagen del plato con ratio estilizado */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-beige-100 mb-4">
          <img
            src={producto.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-celeste-400" />
            <span>~{producto.tiempo_estimado_min} min</span>
          </div>
          <div className="absolute top-2 right-2 bg-vino-700 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-md">
            Bs. {producto.precio.toFixed(2)}
          </div>
        </div>

        {/* Datos del producto */}
        <div className="mb-3">
          <span className="text-[11px] font-semibold tracking-wider text-celeste-700 uppercase">
            {producto.categoria_nombre || 'Especialidad'}
          </span>
          <h3 className="font-serif text-lg font-bold text-vino-950 line-clamp-1 mt-0.5">
            {producto.nombre}
          </h3>
          <p className="text-beige-700 text-xs line-clamp-2 mt-1 leading-relaxed">
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
              className="w-full text-xs px-3 py-2 rounded-lg border border-beige-300 bg-beige-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-vino-500"
            />
          </div>
        )}
      </div>

      {/* Controles de compra */}
      <div className="pt-3 border-t border-beige-100 flex items-center justify-between gap-2">
        <div className="flex items-center border border-beige-200 rounded-xl bg-beige-50/80 p-0.5">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-7 h-7 flex items-center justify-center text-beige-700 hover:text-vino-800 hover:bg-white rounded-lg transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 text-center font-bold text-sm text-vino-950">{cantidad}</span>
          <button
            onClick={() => setCantidad(cantidad + 1)}
            className="w-7 h-7 flex items-center justify-center text-beige-700 hover:text-vino-800 hover:bg-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-[11px] text-beige-600 hover:text-vino-800 underline px-1"
          >
            {showNotes ? 'Ocultar' : '+ Nota'}
          </button>

          <button
            onClick={handleAdd}
            disabled={!producto.disponible}
            className={`btn-vino text-xs py-2 px-3 flex-1 max-w-[130px] ${
              addedAnimation ? 'bg-emerald-600 hover:bg-emerald-600' : ''
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
