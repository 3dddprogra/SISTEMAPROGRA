import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Banknote, QrCode, ArrowLeftRight, Printer } from 'lucide-react';
import { Pedido, MetodoPago } from '../../types';

interface Props {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
  onProcessPayment: (pedidoId: number, metodo: MetodoPago) => Promise<void>;
  loading: boolean;
}

export const BillingModal: React.FC<Props> = ({
  pedido,
  isOpen,
  onClose,
  onProcessPayment,
  loading,
}) => {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [montoEntregado, setMontoEntregado] = useState<string>('');
  const [pagoExitoso, setPagoExitoso] = useState(false);

  if (!isOpen || !pedido) return null;

  const total = pedido.total;
  const entregadoNum = parseFloat(montoEntregado) || 0;
  const cambio = Math.max(0, entregadoNum - total);

  const handleConfirm = async () => {
    await onProcessPayment(pedido.id, metodo);
    setPagoExitoso(true);
    setTimeout(() => {
      setPagoExitoso(false);
      onClose();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-beige-200 overflow-hidden">
        {/* Header modal */}
        <div className="p-6 bg-beige-50/80 border-b border-beige-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vino-700 text-white flex items-center justify-center">
              <Banknote className="w-5 h-5 text-beige-100" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-vino-950">
                Facturación y Cobro
              </h3>
              <p className="text-xs text-beige-600">
                Comanda #{pedido.codigo} • Mesa #{pedido.numero_mesa || pedido.mesa_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-beige-500 hover:text-vino-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Detalle de la comanda */}
        <div className="p-6 space-y-5">
          {/* Ticket de consumo */}
          <div className="border border-beige-200 rounded-2xl p-4 bg-beige-50/40 font-mono text-xs space-y-2">
            <div className="text-center pb-2 border-b border-dashed border-beige-300">
              <h4 className="font-bold text-sm font-serif text-vino-950">RESTAURANTE FOODTECH UNICEN</h4>
              <p className="text-[11px] text-beige-600">Cochabamba - Bolivia • NIT: 1029384756</p>
            </div>

            <div className="space-y-1 py-1">
              {pedido.detalles?.map((d) => (
                <div key={d.id || d.producto_id} className="flex justify-between items-center text-beige-900">
                  <span>
                    {d.cantidad}x {d.nombre_producto}
                  </span>
                  <span>Bs. {d.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-beige-300 flex justify-between items-center font-bold text-base text-vino-950">
              <span>TOTAL A COBRAR:</span>
              <span className="text-vino-700 font-serif">Bs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-vino-950 uppercase tracking-wider mb-2">
              Seleccionar Forma de Pago:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMetodo('efectivo')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'efectivo'
                    ? 'border-vino-700 bg-vino-50 text-vino-900 shadow-sm'
                    : 'border-beige-200 bg-white text-beige-700 hover:bg-beige-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('tarjeta')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'tarjeta'
                    ? 'border-vino-700 bg-vino-50 text-vino-900 shadow-sm'
                    : 'border-beige-200 bg-white text-beige-700 hover:bg-beige-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-vino-600" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('qr')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'qr'
                    ? 'border-vino-700 bg-vino-50 text-vino-900 shadow-sm'
                    : 'border-beige-200 bg-white text-beige-700 hover:bg-beige-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-celeste-600" />
                <span>Pago QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('transferencia')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'transferencia'
                    ? 'border-vino-700 bg-vino-50 text-vino-900 shadow-sm'
                    : 'border-beige-200 bg-white text-beige-700 hover:bg-beige-50'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5 text-amber-600" />
                <span>Transf.</span>
              </button>
            </div>
          </div>

          {/* Calculadora de cambio si es efectivo */}
          {metodo === 'efectivo' && (
            <div className="p-3.5 rounded-xl bg-beige-100/60 border border-beige-200 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-beige-800">Monto Entregado (Bs.):</label>
                <input
                  type="number"
                  step="0.50"
                  min={total}
                  placeholder={total.toFixed(2)}
                  value={montoEntregado}
                  onChange={(e) => setMontoEntregado(e.target.value)}
                  className="w-32 text-right font-bold text-sm px-3 py-1.5 border border-beige-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vino-600"
                />
              </div>
              {entregadoNum >= total && (
                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-beige-200 text-emerald-800">
                  <span>Cambio / Vuelto:</span>
                  <span className="text-sm">Bs. {cambio.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer y Acciones */}
        <div className="p-6 bg-beige-50/80 border-t border-beige-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-outline-vino text-xs py-2.5 px-3 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || pagoExitoso}
            className={`btn-vino flex-1 py-3 text-sm font-bold shadow-md ${
              pagoExitoso ? 'bg-emerald-600 hover:bg-emerald-600' : ''
            }`}
          >
            {pagoExitoso ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                ¡Cobrado y Mesa Liberada!
              </span>
            ) : loading ? (
              <span>Procesando Cobro...</span>
            ) : (
              <span>Confirmar Pago y Liberar Mesa</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
