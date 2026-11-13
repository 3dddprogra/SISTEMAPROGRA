import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  mesaNumero: number;
  onUpdateQuantity: (productoId: number, delta: number) => void;
  onRemoveItem: (productoId: number) => void;
  onConfirmOrder: (notasGenerales: string) => void;
  submitting: boolean;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  mesaNumero,
  onUpdateQuantity,
  onRemoveItem,
  onConfirmOrder,
  submitting,
}) => {
  const [notas, setNotas] = React.useState('');

  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-beige-200">
          {/* Header del carrito */}
          <div className="p-5 border-b border-beige-200 bg-beige-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-vino-700 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-beige-100" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-vino-950">Su Comanda</h2>
                <span className="text-xs font-semibold text-celeste-700">Mesa #{mesaNumero}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-beige-600 hover:text-vino-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de productos en el carrito */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-beige-600">
                <ShoppingBag className="w-16 h-16 text-beige-300 mb-3" />
                <p className="text-base font-semibold text-vino-900">Su carrito está vacío</p>
                <p className="text-xs text-beige-600 mt-1 max-w-xs">
                  Seleccione deliciosos platos de nuestro menú para comenzar su orden.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.producto.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-beige-200 bg-beige-50/40 hover:bg-beige-50 transition-colors gap-3"
                >
                  <img
                    src={item.producto.imagen_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                    alt={item.producto.nombre}
                    className="w-14 h-14 object-cover rounded-lg bg-beige-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-vino-950 truncate">{item.producto.nombre}</h4>
                    <p className="text-xs text-beige-700">Bs. {item.producto.precio.toFixed(2)} c/u</p>
                    {item.notas && (
                      <p className="text-[11px] text-celeste-700 italic truncate mt-0.5">
                        Nota: {item.notas}
                      </p>
                    )}
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1.5 bg-white border border-beige-200 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.producto.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-beige-700 hover:text-vino-800"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-vino-950">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.producto.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-beige-700 hover:text-vino-800"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.producto.id)}
                    className="p-1.5 text-beige-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {/* Input notas generales de la comanda */}
            {items.length > 0 && (
              <div className="mt-4 pt-3 border-t border-beige-200">
                <label className="block text-xs font-semibold text-vino-950 mb-1.5">
                  Notas generales para la cocina:
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Servir bebidas de inmediato, sin cubiertos de plástico..."
                  className="w-full text-xs p-3 rounded-xl border border-beige-300 bg-beige-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-vino-600"
                />
              </div>
            )}
          </div>

          {/* Footer con Total y Enviar a Cocina */}
          {items.length > 0 && (
            <div className="p-5 border-t border-beige-200 bg-beige-50/80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-beige-700">Subtotal de platos:</span>
                <span className="font-semibold text-beige-900">Bs. {total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-serif font-bold text-vino-950">Total a Pagar:</span>
                <span className="font-serif font-bold text-xl text-vino-700">Bs. {total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => onConfirmOrder(notas)}
                disabled={submitting}
                className="btn-vino w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Enviando a Cocina...</span>
                ) : (
                  <>
                    <span>Confirmar y Enviar Pedido</span>
                    <ArrowRight className="w-5 h-5 text-beige-200" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-beige-600">
                Su comanda se sincronizará inmediatamente en las pantallas de cocina (KDS).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
