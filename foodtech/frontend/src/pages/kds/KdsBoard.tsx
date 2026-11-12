import React, { useState, useEffect } from 'react';
import { ChefHat, Volume2, VolumeX, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Pedido, EstadoPedido } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useSound } from '../../hooks/useSound';
import { OrderCard } from '../../components/kds/OrderCard';

export const KdsBoard: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { socket, isConnected } = useSocket({ type: 'cocina' });
  const { playKitchenChime } = useSound();

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar pedidos activos de cocina (pendiente, en_proceso, terminado)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<Pedido[]>('/pedidos');
      const activos = res.filter((p) =>
        ['pendiente', 'en_proceso', 'terminado'].includes(p.estado)
      );
      setPedidos(activos);
    } catch (err) {
      console.error('Error al cargar pedidos en KDS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Escuchar eventos en vivo de Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNuevoPedido = (nuevo: Pedido) => {
      setPedidos((prev) => {
        if (prev.some((p) => p.id === nuevo.id)) return prev;
        return [nuevo, ...prev];
      });
      if (soundEnabled) {
        playKitchenChime();
      }
    };

    const handleEstadoPedido = (actualizado: Pedido) => {
      setPedidos((prev) => {
        if (['entregado', 'pagado', 'cancelado'].includes(actualizado.estado)) {
          return prev.filter((p) => p.id !== actualizado.id);
        }
        const exists = prev.some((p) => p.id === actualizado.id);
        if (exists) {
          return prev.map((p) => (p.id === actualizado.id ? actualizado : p));
        } else {
          return [...prev, actualizado];
        }
      });
    };

    socket.on('pedido:nuevo', handleNuevoPedido);
    socket.on('pedido:estado', handleEstadoPedido);

    return () => {
      socket.off('pedido:nuevo', handleNuevoPedido);
      socket.off('pedido:estado', handleEstadoPedido);
    };
  }, [socket, soundEnabled, playKitchenChime]);

  // Avanzar estado del pedido mediante API
  const handleAdvanceState = async (pedidoId: number, nextState: EstadoPedido) => {
    setLoadingId(pedidoId);
    try {
      const res = await api.patch<Pedido>(`/pedidos/${pedidoId}/estado`, {
        estado: nextState,
      });

      // Actualizar estado local inmediatamente
      setPedidos((prev) => {
        if (['entregado', 'pagado', 'cancelado'].includes(nextState)) {
          return prev.filter((p) => p.id !== pedidoId);
        }
        return prev.map((p) => (p.id === pedidoId ? res : p));
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado del pedido');
    } finally {
      setLoadingId(null);
    }
  };

  // Filtrado de pedidos por columnas Kanban
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');
  const enProceso = pedidos.filter((p) => p.estado === 'en_proceso');
  const terminados = pedidos.filter((p) => p.estado === 'terminado');

  return (
    <div className="min-h-screen bg-beige-100/60 p-4 sm:p-6 pb-16 flex flex-col">
      {/* Barra de control superior de KDS */}
      <header className="bg-white border border-beige-200 rounded-2xl p-4 sm:p-5 shadow-warm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-celeste-600 text-white flex items-center justify-center shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-vino-950">
              Kitchen Display System (KDS)
            </h1>
            <div className="flex items-center gap-2 text-xs text-beige-600 mt-0.5">
              <span>{pedidos.length} comandas en preparación activa</span>
              <span>•</span>
              <span className={isConnected ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                {isConnected ? '🟢 Sockets Sincronizados' : '🟠 Reconectando'}
              </span>
            </div>
          </div>
        </div>

        {/* Reloj y Controles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-beige-50 border border-beige-200 font-mono text-sm font-bold text-vino-900">
            <Clock className="w-4 h-4 text-celeste-600" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-celeste-50 text-celeste-700 border-celeste-300'
                : 'bg-beige-100 text-beige-500 border-beige-200'
            }`}
            title={soundEnabled ? 'Silenciar campanilla' : 'Activar campanilla'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-beige-100 text-beige-700 hover:text-vino-800 border border-beige-200"
            title="Refrescar comanderas"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tablero Kanban de Cocina en 3 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Columna 1: PENDIENTES */}
        <section className="bg-beige-50/70 border border-beige-300 rounded-3xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-300/80">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="font-serif text-lg font-bold text-amber-950">Nuevos Pedidos</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {pendientes.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center text-xs text-beige-500">
                Sin pedidos pendientes de ingreso
              </div>
            ) : (
              pendientes.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  onAdvanceState={handleAdvanceState}
                  loadingId={loadingId}
                />
              ))
            )}
          </div>
        </section>

        {/* Columna 2: EN PROCESO */}
        <section className="bg-beige-50/70 border border-celeste-300 rounded-3xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-celeste-400/80">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-celeste-500 animate-spin"></span>
              <h2 className="font-serif text-lg font-bold text-celeste-950">En Preparación</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-celeste-100 text-celeste-900 text-xs font-bold border border-celeste-300">
              {enProceso.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {enProceso.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center text-xs text-beige-500">
                Ningún plato en cocción activa
              </div>
            ) : (
              enProceso.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  onAdvanceState={handleAdvanceState}
                  loadingId={loadingId}
                />
              ))
            )}
          </div>
        </section>

        {/* Columna 3: TERMINADOS */}
        <section className="bg-beige-50/70 border border-emerald-300 rounded-3xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-400/80">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
              <h2 className="font-serif text-lg font-bold text-emerald-950">Listos en Barra</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              {terminados.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {terminados.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center text-xs text-beige-500">
                No hay platos listos para despachar
              </div>
            ) : (
              terminados.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  onAdvanceState={handleAdvanceState}
                  loadingId={loadingId}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
