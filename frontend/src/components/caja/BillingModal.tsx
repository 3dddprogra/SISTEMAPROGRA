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
      <div className="relative bg-carbon-100 rounded-3xl max-w-xl w-full shadow-2xl border border-carbon-200 overflow-hidden">
        {/* Header modal */}
        <div className="p-6 bg-carbon-50/80 border-b border-carbon-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracota-700 text-white flex items-center justify-center">
              <Banknote className="w-5 h-5 text-carbon-900" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-carbon-900">
                Facturación y Cobro
              </h3>
              <p className="text-xs text-carbon-600">
                Comanda #{pedido.codigo} • Mesa #{pedido.numero_mesa || pedido.mesa_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-carbon-500 hover:text-terracota-400 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Detalle de la comanda */}
        <div className="p-6 space-y-5">
          {/* Ticket de consumo */}
          <div className="border border-carbon-200 rounded-2xl p-4 bg-carbon-50/40 font-mono text-xs space-y-2">
            <div className="text-center pb-2 border-b border-dashed border-carbon-300">
              <h4 className="font-bold text-sm font-serif text-carbon-900">RESTAURANTE FOODTECH UNICEN</h4>
              <p className="text-[11px] text-carbon-600">Cochabamba - Bolivia • NIT: 1029384756</p>
            </div>

            <div className="space-y-1 py-1">
              {pedido.detalles?.map((d) => (
                <div key={d.id || d.producto_id} className="flex justify-between items-center text-carbon-900">
                  <span>
                    {d.cantidad}x {d.nombre_producto}
                  </span>
                  <span>Bs. {d.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-carbon-300 flex justify-between items-center font-bold text-base text-carbon-900">
              <span>TOTAL A COBRAR:</span>
              <span className="text-terracota-400 font-serif">Bs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-carbon-900 uppercase tracking-wider mb-2">
              Seleccionar Forma de Pago:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMetodo('efectivo')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'efectivo'
                    ? 'border-terracota-700 bg-terracota-50 text-carbon-900 shadow-sm'
                    : 'border-carbon-200 bg-carbon-100 text-carbon-700 hover:bg-carbon-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-verde-400" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('tarjeta')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'tarjeta'
                    ? 'border-terracota-700 bg-terracota-50 text-carbon-900 shadow-sm'
                    : 'border-carbon-200 bg-carbon-100 text-carbon-700 hover:bg-carbon-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-terracota-400" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('qr')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'qr'
                    ? 'border-terracota-700 bg-terracota-50 text-carbon-900 shadow-sm'
                    : 'border-carbon-200 bg-carbon-100 text-carbon-700 hover:bg-carbon-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-ocre-400" />
                <span>Pago QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('transferencia')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  metodo === 'transferencia'
                    ? 'border-terracota-700 bg-terracota-50 text-carbon-900 shadow-sm'
                    : 'border-carbon-200 bg-carbon-100 text-carbon-700 hover:bg-carbon-50'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5 text-ocre-400" />
                <span>Transf.</span>
              </button>
            </div>
          </div>

          {/* Calculadora de cambio si es efectivo */}
          {metodo === 'efectivo' && (
            <div className="p-3.5 rounded-xl bg-carbon-100/60 border border-carbon-200 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-carbon-800">Monto Entregado (Bs.):</label>
                <input
                  type="number"
                  step="0.50"
                  min={total}
                  placeholder={total.toFixed(2)}
                  value={montoEntregado}
                  onChange={(e) => setMontoEntregado(e.target.value)}
                  className="w-32 text-right font-bold text-sm px-3 py-1.5 border border-carbon-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-terracota-600"
                />
              </div>
              {entregadoNum >= total && (
                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-carbon-200 text-verde-400">
                  <span>Cambio / Vuelto:</span>
                  <span className="text-sm">Bs. {cambio.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer y Acciones */}
        <div className="p-6 bg-carbon-50/80 border-t border-carbon-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-contorno text-xs py-2.5 px-3 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || pagoExitoso}
            className={`btn-primario flex-1 py-3 text-sm font-bold shadow-md ${
              pagoExitoso ? 'bg-verde-600 hover:bg-verde-600' : ''
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
