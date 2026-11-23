import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid,
  List,
  Receipt,
  Calendar,
  Clock,
  TrendingUp,
  UserPlus,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  ShoppingBag,
  Truck,
  Package,
} from 'lucide-react';
import { Mesa, Pedido, Reserva, ListaEspera, ResumenFacturacion, MetodoPago, EstadoMesa, Producto } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { FloorMap } from '../../components/caja/FloorMap';
import { TableList } from '../../components/caja/TableList';
import { BillingModal } from '../../components/caja/BillingModal';
import { ReservationModal } from '../../components/caja/ReservationModal';
import { WaitlistModal } from '../../components/caja/WaitlistModal';
import { Badge } from '../../components/common/Badge';

export const CajaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'salon' | 'pedidos' | 'menu' | 'reservas' | 'espera' | 'reportes'>('salon');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Estados de datos
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [listaEspera, setListaEspera] = useState<ListaEspera[]>([]);
  const [resumen, setResumen] = useState<ResumenFacturacion | null>(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  // WebSockets en sala de caja
  const { socket } = useSocket({ type: 'caja' });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [mesasRes, pedidosRes, reservasRes, esperaRes, resumenRes, productosRes] = await Promise.all([
        api.get<Mesa[]>('/mesas'),
        api.get<Pedido[]>('/pedidos'),
        api.get<Reserva[]>('/reservas'),
        api.get<ListaEspera[]>('/lista-espera'),
        api.get<ResumenFacturacion>('/facturacion/resumen').catch(() => null),
        api.get<Producto[]>('/productos').catch(() => [] as Producto[]),
      ]);

      setMesas(mesasRes || []);
      setPedidos(pedidosRes || []);
      setReservas(reservasRes || []);
      setListaEspera(esperaRes || []);
      setResumen(resumenRes);
      setProductos(productosRes || []);
    } catch (err) {
      console.error('Error cargando datos de caja:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Escuchar eventos en vivo de Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('pedido:nuevo', (nuevo: Pedido) => {
      setPedidos((prev) => [nuevo, ...prev.filter((p) => p.id !== nuevo.id)]);
      setMesas((prev) =>
        prev.map((m) => (m.id === nuevo.mesa_id && m.numero !== 8 ? { ...m, estado: 'ocupada' } : m))
      );
    });

    socket.on('pedido:estado', (actualizado: Pedido) => {
      // Pre-pago: la mesa NO se libera al pagar; la libera el cajero cuando el cliente se retira
      setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      api.get<ResumenFacturacion>('/facturacion/resumen').then(setResumen).catch(() => undefined);
    });

    socket.on('mesa:estado', ({ mesaId, estado }: { mesaId: number; estado: EstadoMesa }) => {
      setMesas((prev) => prev.map((m) => (m.id === mesaId ? { ...m, estado } : m)));
    });

    socket.on('reserva:actualizada', (reserva: Reserva) => {
      setReservas((prev) => {
        const exists = prev.some((r) => r.id === reserva.id);
        return exists ? prev.map((r) => (r.id === reserva.id ? reserva : r)) : [reserva, ...prev];
      });
    });

    socket.on('espera:actualizada', (item: ListaEspera) => {
      setListaEspera((prev) => {
        const exists = prev.some((e) => e.id === item.id);
        return exists ? prev.map((e) => (e.id === item.id ? item : e)) : [item, ...prev];
      });
    });

    return () => {
      socket.off('pedido:nuevo');
      socket.off('pedido:estado');
      socket.off('mesa:estado');
      socket.off('reserva:actualizada');
      socket.off('espera:actualizada');
    };
  }, [socket]);

  // Mapa de pedidos activos por mesa
  const pedidosActivosPorMesa = new Map<number, Pedido>();
  // Pedido en curso = aún no entregado ni cancelado. Si una mesa tiene uno por cobrar, ese se muestra primero.
  const ESTADOS_EN_CURSO = ['por_cobrar', 'pagado', 'en_proceso', 'terminado'];
  const pedidosEnCurso = pedidos.filter((p) => ESTADOS_EN_CURSO.includes(p.estado));
  [...pedidosEnCurso]
    .sort((a, b) => Number(a.estado === 'por_cobrar') - Number(b.estado === 'por_cobrar'))
    .forEach((p) => {
      pedidosActivosPorMesa.set(p.mesa_id, p);
    });
  const pedidosPorCobrar = pedidosEnCurso.filter((p) => p.estado === 'por_cobrar');
  const pedidosEnCocina = pedidosEnCurso.filter((p) => p.estado !== 'por_cobrar');
  const mesasSalon = mesas.filter((m) => m.numero !== 8);

  // Manejo de Cobro
  const handleOpenBilling = (mesa: Mesa, pedido?: Pedido) => {
    const p = pedido || pedidosActivosPorMesa.get(mesa.id);
    if (p && p.estado === 'por_cobrar') {
      setSelectedPedido(p);
      setIsBillingOpen(true);
    }
  };

  const handleProcessPayment = async (pedidoId: number, metodo: MetodoPago) => {
    setBillingLoading(true);
    try {
      await api.post(`/pedidos/${pedidoId}/cobrar`, { metodo_pago: metodo });
      // Recargar datos actualizados
      await loadAllData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al procesar cobro');
    } finally {
      setBillingLoading(false);
    }
  };

  // Marcar un pedido como entregado (RN08: la mesa se libera aparte, cuando el cliente se retira)
  const handleEntregar = async (pedidoId: number) => {
    try {
      await api.patch(`/pedidos/${pedidoId}/estado`, { estado: 'entregado' });
      await loadAllData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al marcar como entregado');
    }
  };

  const handleCancelarPedido = async (pedidoId: number) => {
    if (!window.confirm('¿Cancelar este pedido? Solo se puede cancelar antes de iniciar su preparación.')) return;
    try {
      await api.patch(`/pedidos/${pedidoId}/estado`, { estado: 'cancelado' });
      await loadAllData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cancelar el pedido');
    }
  };

  // HU10: marcar un producto como agotado (el menú digital deja de ofrecerlo)
  const handleToggleDisponible = async (producto: Producto) => {
    try {
      await api.patch(`/productos/${producto.id}/disponibilidad`, { disponible: !producto.disponible });
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, disponible: !p.disponible } : p)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cambiar la disponibilidad');
    }
  };

  const handleUpdateEstadoMesa = async (mesaId: number, estado: EstadoMesa) => {
    try {
      await api.patch(`/mesas/${mesaId}/estado`, { estado });
      setMesas((prev) => prev.map((m) => (m.id === mesaId ? { ...m, estado } : m)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de mesa');
    }
  };

  // Manejo de Reservas
  const handleCreateReservation = async (data: Parameters<typeof api.post>[1]) => {
    await api.post('/reservas', data);
    const res = await api.get<Reserva[]>('/reservas');
    setReservas(res);
  };

  const handleUpdateReservaEstado = async (id: number, estado: string) => {
    await api.patch(`/reservas/${id}/estado`, { estado });
    setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado: estado as any } : r)));
  };

  // Manejo de Lista de Espera
  const handleAddWaitlist = async (data: Parameters<typeof api.post>[1]) => {
    await api.post('/lista-espera', data);
    const res = await api.get<ListaEspera[]>('/lista-espera');
    setListaEspera(res);
  };

  const handleSentarCliente = async (esperaId: number, mesaId: number) => {
    await api.post(`/lista-espera/${esperaId}/sentar`, { mesa_id: mesaId });
    await loadAllData();
  };

  const mesasLibres = mesas.filter((m) => m.estado === 'disponible' && m.numero !== 8);

  return (
    <div className="min-h-screen bg-carbon-50 p-4 sm:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado y Métricas Rápidas de Caja */}
        <header className="bg-carbon-100 border border-carbon-200 rounded-3xl p-5 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rojo-700 text-white flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-6 h-6 text-carbon-900" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-carbon-900">
                Panel de Caja & Control del Salón
              </h1>
              <span className="text-xs text-carbon-600">
                Gestión en tiempo real de mesas, comandas, reservas y facturación
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/m/8" className="btn-dorado text-xs py-2 px-3.5" title="Registrar un pedido sin mesa (Mostrador – Para llevar)">
              <ShoppingBag className="w-4 h-4" />
              <span>Pedido para llevar</span>
            </Link>

            <button
              onClick={() => setIsReservationOpen(true)}
              className="btn-contorno-dorado text-xs py-2 px-3.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Nueva Reserva</span>
            </button>

            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="btn-contorno text-xs py-2 px-3.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Turno Espera</span>
            </button>

            <button
              onClick={loadAllData}
              className="p-2.5 rounded-xl bg-carbon-100 text-carbon-700 hover:text-rojo-400 border border-carbon-200"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tarjetas KPI Superiores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-gourmet bg-carbon-100 p-4">
            <span className="text-xs font-semibold text-carbon-600 uppercase">Mesas Ocupadas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-rojo-400">
                {mesasSalon.filter((m) => m.estado === 'ocupada').length} / {mesasSalon.length}
              </span>
              <span className="text-xs text-verde-400 font-bold">
                {mesasLibres.length} libres
              </span>
            </div>
          </div>

          <div className="card-gourmet bg-carbon-100 p-4">
            <span className="text-xs font-semibold text-carbon-600 uppercase">Comandas Activas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-amarillo-400">
                {pedidosEnCurso.length}
              </span>
              <span className="text-xs text-carbon-600">{pedidosPorCobrar.length} por cobrar</span>
            </div>
          </div>

          <div className="card-gourmet bg-carbon-100 p-4">
            <span className="text-xs font-semibold text-carbon-600 uppercase">Lista de Espera</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-amarillo-400">
                {listaEspera.filter((l) => l.estado === 'esperando').length}
              </span>
              <span className="text-xs text-carbon-600">grupos esperando</span>
            </div>
          </div>

          <div className="card-gourmet bg-carbon-100 p-4">
            <span className="text-xs font-semibold text-carbon-600 uppercase">Total Facturado</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-carbon-900">
                Bs. {(resumen?.ingresosTotales || 0).toFixed(2)}
              </span>
              <span className="text-xs text-verde-400 font-bold">
                {resumen?.pedidosCompletados || 0} cobros
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex items-center gap-2 border-b border-carbon-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('salon')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'salon'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <Grid className="w-4 h-4" />
            Salón de Mesas
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Cobro de Pedidos ({pedidosPorCobrar.length})
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos ({productos.filter((p) => !p.disponible).length} agotados)
          </button>

          <button
            onClick={() => setActiveTab('reservas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reservas'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas ({reservas.length})
          </button>

          <button
            onClick={() => setActiveTab('espera')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'espera'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            Lista de Espera ({listaEspera.filter((l) => l.estado === 'esperando').length})
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reportes'
                ? 'bg-rojo-700 text-white shadow-sm'
                : 'text-carbon-700 hover:bg-carbon-100 hover:text-rojo-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Facturación & Reportes
          </button>
        </div>

        {/* CONTENIDO TAB 1: SALÓN (VISTA DUAL) */}
        {activeTab === 'salon' && (
          <div className="space-y-4">
            {/* Selector de Vista Dual (Mapa vs Lista) */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-carbon-900">
                Rotación de Mesas en Salón
              </h2>
              <div className="flex items-center gap-1 bg-carbon-100 border border-carbon-200 p-1 rounded-xl shadow-xs">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'map'
                      ? 'bg-rojo-700 text-white shadow-xs'
                      : 'text-carbon-600 hover:text-rojo-400'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  Mapa Salón
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-rojo-700 text-white shadow-xs'
                      : 'text-carbon-600 hover:text-rojo-400'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Lista Detallada
                </button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <FloorMap
                onUpdateEstadoMesa={handleUpdateEstadoMesa}
                mesas={mesas}
                pedidosActivos={pedidosActivosPorMesa}
                onSelectMesa={handleOpenBilling}
              />
            ) : (
              <TableList
                mesas={mesas}
                pedidosActivos={pedidosActivosPorMesa}
                onSelectMesa={handleOpenBilling}
                onUpdateEstadoMesa={handleUpdateEstadoMesa}
              />
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: COBRO ANTICIPADO (PRE-PAGO) */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            {/* Bandeja: pedidos por cobrar. La cocina solo recibe el pedido cuando se confirma el pago. */}
            <div className="card-gourmet bg-carbon-100 space-y-4">
              <h2 className="font-serif text-lg font-bold text-carbon-900 pb-2 border-b border-carbon-200">
                Pedidos por cobrar ({pedidosPorCobrar.length})
              </h2>

              {pedidosPorCobrar.length === 0 ? (
                <div className="text-center py-10 text-carbon-500">
                  <Receipt className="w-12 h-12 mx-auto text-carbon-400 mb-2" />
                  <p>No hay pedidos esperando cobro</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pedidosPorCobrar.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-amarillo-300 bg-carbon-50/50 hover:shadow-warm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-carbon-200">
                          <span className="font-serif font-bold text-lg text-carbon-900">
                            {p.numero_mesa === 8 ? 'PARA LLEVAR' : `MESA #${p.numero_mesa || p.mesa_id}`}
                          </span>
                          <Badge tipo="pedido" estado={p.estado} size="sm" />
                        </div>
                        <ul className="py-2.5 space-y-1 text-xs text-carbon-800">
                          {p.detalles?.map((d, i) => (
                            <li key={d.id || i}>
                              <strong>{d.cantidad}×</strong> {d.nombre_producto}
                              {d.notas && <span className="text-amarillo-400"> ({d.notas})</span>}
                            </li>
                          ))}
                        </ul>
                        <div className="text-[11px] text-carbon-600">
                          #{p.codigo} · {new Date(p.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-carbon-200 flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-lg text-amarillo-400">
                          Bs. {p.total.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancelarPedido(p.id)}
                            className="text-[11px] font-bold text-peligro-400 hover:text-carbon-900 px-2 py-2"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPedido(p);
                              setIsBillingOpen(true);
                            }}
                            className="btn-primario text-xs py-2 px-3.5"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Cobrar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedidos ya pagados: en cocina o listos para entregar */}
            <div className="card-gourmet bg-carbon-100 space-y-4">
              <h2 className="font-serif text-lg font-bold text-carbon-900 pb-2 border-b border-carbon-200">
                Pagados · en cocina o por entregar ({pedidosEnCocina.length})
              </h2>

              {pedidosEnCocina.length === 0 ? (
                <p className="text-center py-6 text-sm text-carbon-500">No hay pedidos pagados en curso</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pedidosEnCocina.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl border border-carbon-200 bg-carbon-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-carbon-200">
                          <span className="font-serif font-bold text-lg text-carbon-900">
                            {p.numero_mesa === 8 ? 'PARA LLEVAR' : `MESA #${p.numero_mesa || p.mesa_id}`}
                          </span>
                          <Badge tipo="pedido" estado={p.estado} size="sm" />
                        </div>
                        <div className="py-2.5 text-xs text-carbon-600 space-y-0.5">
                          <div>#{p.codigo} · {p.metodo_pago === 'qr' ? 'Pago QR' : 'Efectivo'}</div>
                          <div>{p.detalles?.map((d) => `${d.cantidad}× ${d.nombre_producto}`).join(', ')}</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-carbon-200 flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-base text-amarillo-400">Bs. {p.total.toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          {p.estado === 'pagado' && (
                            <button
                              onClick={() => handleCancelarPedido(p.id)}
                              className="text-[11px] font-bold text-peligro-400 hover:text-carbon-900 px-2 py-2"
                            >
                              Cancelar
                            </button>
                          )}
                          {p.estado === 'terminado' && (
                            <button onClick={() => handleEntregar(p.id)} className="btn-dorado text-xs py-2 px-3.5">
                              <Truck className="w-3.5 h-3.5" />
                              Marcar entregado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO TAB: PRODUCTOS (marcar agotados) */}
        {activeTab === 'menu' && (
          <div className="card-gourmet bg-carbon-100 space-y-4">
            <div className="pb-2 border-b border-carbon-200">
              <h2 className="font-serif text-lg font-bold text-carbon-900">Productos del menú</h2>
              <p className="text-xs text-carbon-600">Marca como agotado un producto sin ingredientes: el menú digital dejará de ofrecerlo.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {productos.map((prod) => (
                <div
                  key={prod.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                    prod.disponible ? 'border-carbon-200 bg-carbon-50/50' : 'border-peligro-300 bg-peligro-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-carbon-900 truncate">{prod.nombre}</div>
                    <div className="text-xs text-carbon-600">{prod.categoria_nombre} · Bs. {Number(prod.precio).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleToggleDisponible(prod)}
                    className={`text-[11px] font-bold px-3 py-2 rounded-lg border whitespace-nowrap ${
                      prod.disponible
                        ? 'border-peligro-300 text-peligro-400 hover:bg-peligro-100'
                        : 'border-verde-300 text-verde-400 hover:bg-verde-100'
                    }`}
                  >
                    {prod.disponible ? 'Marcar agotado' : 'Volver a disponible'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 3: RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="card-gourmet bg-carbon-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-200">
              <h2 className="font-serif text-lg font-bold text-carbon-900">
                Reservaciones de Salón
              </h2>
              <button
                onClick={() => setIsReservationOpen(true)}
                className="btn-dorado text-xs py-2 px-3 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Reserva
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-carbon-900">
                <thead className="bg-carbon-100/70 text-carbon-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Mesa</th>
                    <th className="py-3 px-4">Personas</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-100">
                  {reservas.map((r) => (
                    <tr key={r.id} className="hover:bg-carbon-50/60">
                      <td className="py-3 px-4 font-bold text-carbon-900">{r.cliente_nombre}</td>
                      <td className="py-3 px-4 text-carbon-600">{r.cliente_telefono}</td>
                      <td className="py-3 px-4 font-bold text-rojo-400">Mesa #{r.numero_mesa || r.mesa_id}</td>
                      <td className="py-3 px-4">{r.num_personas} pers.</td>
                      <td className="py-3 px-4 font-mono">{new Date(r.fecha_hora).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amarillo-100 text-amarillo-400 border border-amarillo-300">
                          {r.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {r.estado === 'pendiente' && (
                          <button
                            onClick={() => handleUpdateReservaEstado(r.id, 'confirmada')}
                            className="p-1.5 rounded-lg bg-verde-50 text-verde-400 hover:bg-verde-100"
                            title="Confirmar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.estado !== 'cancelada' && (
                          <button
                            onClick={() => handleUpdateReservaEstado(r.id, 'cancelada')}
                            className="p-1.5 rounded-lg bg-peligro-50 text-peligro-400 hover:bg-peligro-100"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 4: LISTA DE ESPERA */}
        {activeTab === 'espera' && (
          <div className="card-gourmet bg-carbon-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-200">
              <h2 className="font-serif text-lg font-bold text-carbon-900">
                Lista de Espera y Turnos
              </h2>
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="btn-primario text-xs py-2 px-3 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir a la Espera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listaEspera
                .filter((l) => l.estado === 'esperando')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-carbon-200 bg-carbon-50/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-carbon-200">
                        <span className="font-bold text-base text-carbon-900">
                          Turno #{item.posicion} • {item.cliente_nombre}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amarillo-100 text-amarillo-400 border border-amarillo-300">
                          ~{item.tiempo_estimado_espera} min
                        </span>
                      </div>
                      <div className="py-2 text-xs space-y-1 text-carbon-700">
                        <p>Teléfono: <strong>{item.telefono}</strong></p>
                        <p>Grupo: <strong>{item.num_personas} personas</strong></p>
                        {item.notas && <p className="italic text-carbon-600">"{item.notas}"</p>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-carbon-200">
                      <label className="block text-[11px] font-bold text-carbon-700 mb-1">
                        Asignar y sentar en mesa:
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id={`mesa-select-${item.id}`}
                          className="text-xs p-2 rounded-xl border border-carbon-300 bg-carbon-100 flex-1"
                        >
                          {mesasLibres.map((m) => (
                            <option key={m.id} value={m.id}>
                              Mesa #{m.numero} (Cap: {m.capacidad})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(
                              `mesa-select-${item.id}`
                            ) as HTMLSelectElement;
                            if (sel && sel.value) {
                              handleSentarCliente(item.id, Number(sel.value));
                            }
                          }}
                          disabled={mesasLibres.length === 0}
                          className="btn-dorado text-xs py-2 px-3 font-bold"
                        >
                          Sentar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 5: FACTURACIÓN & REPORTES */}
        {activeTab === 'reportes' && resumen && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desglose por Método de Pago */}
              <div className="card-gourmet bg-carbon-100">
                <h3 className="font-serif text-lg font-bold text-carbon-900 mb-3 pb-2 border-b border-carbon-200">
                  Desglose por Métodos de Pago
                </h3>
                <div className="space-y-3">
                  {resumen.metodosPago.map((m) => (
                    <div
                      key={m.metodo}
                      className="flex items-center justify-between p-3 rounded-xl bg-carbon-50/70 border border-carbon-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-bold text-sm text-carbon-900">
                          {m.metodo}
                        </span>
                        <span className="text-xs text-carbon-600">({m.cantidad} transacciones)</span>
                      </div>
                      <span className="font-serif font-bold text-base text-rojo-400">
                        Bs. {m.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Platos Más Vendidos */}
              <div className="card-gourmet bg-carbon-100">
                <h3 className="font-serif text-lg font-bold text-carbon-900 mb-3 pb-2 border-b border-carbon-200">
                  Top 5 Especialidades Más Vendidas
                </h3>
                <div className="space-y-3">
                  {resumen.topProductos.map((p, idx) => (
                    <div
                      key={p.nombre}
                      className="flex items-center justify-between p-3 rounded-xl bg-carbon-50/70 border border-carbon-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amarillo-600 text-white font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-carbon-900 text-sm">{p.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-carbon-900 block">{p.cantidad} porciones</span>
                        <span className="text-carbon-600">Bs. {p.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cobro */}
        <BillingModal
          pedido={selectedPedido}
          isOpen={isBillingOpen}
          onClose={() => {
            setIsBillingOpen(false);
            setSelectedPedido(null);
          }}
          onProcessPayment={handleProcessPayment}
          loading={billingLoading}
        />

        {/* Modal de Reserva */}
        <ReservationModal
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
          mesas={mesas}
          onCreateReservation={handleCreateReservation}
        />

        {/* Modal de Lista de Espera */}
        <WaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          onAddWaitlist={handleAddWaitlist}
        />
      </div>
    </div>
  );
};
