import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Mesa, Pedido, Reserva, ListaEspera, ResumenFacturacion, MetodoPago, EstadoMesa } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { FloorMap } from '../../components/caja/FloorMap';
import { TableList } from '../../components/caja/TableList';
import { BillingModal } from '../../components/caja/BillingModal';
import { ReservationModal } from '../../components/caja/ReservationModal';
import { WaitlistModal } from '../../components/caja/WaitlistModal';
import { Badge } from '../../components/common/Badge';

export const CajaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'salon' | 'pedidos' | 'reservas' | 'espera' | 'reportes'>('salon');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Estados de datos
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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
      const [mesasRes, pedidosRes, reservasRes, esperaRes, resumenRes] = await Promise.all([
        api.get<Mesa[]>('/mesas'),
        api.get<Pedido[]>('/pedidos'),
        api.get<Reserva[]>('/reservas'),
        api.get<ListaEspera[]>('/lista-espera'),
        api.get<ResumenFacturacion>('/facturacion/resumen').catch(() => null),
      ]);

      setMesas(mesasRes || []);
      setPedidos(pedidosRes || []);
      setReservas(reservasRes || []);
      setListaEspera(esperaRes || []);
      setResumen(resumenRes);
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
        prev.map((m) => (m.id === nuevo.mesa_id ? { ...m, estado: 'ocupada' } : m))
      );
    });

    socket.on('pedido:estado', (actualizado: Pedido) => {
      setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      if (actualizado.estado === 'pagado') {
        setMesas((prev) =>
          prev.map((m) => (m.id === actualizado.mesa_id ? { ...m, estado: 'disponible' } : m))
        );
      }
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
  pedidos
    .filter((p) => !['pagado', 'cancelado'].includes(p.estado))
    .forEach((p) => {
      pedidosActivosPorMesa.set(p.mesa_id, p);
    });

  // Manejo de Cobro
  const handleOpenBilling = (mesa: Mesa, pedido?: Pedido) => {
    const p = pedido || pedidosActivosPorMesa.get(mesa.id);
    if (p) {
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

  const mesasLibres = mesas.filter((m) => m.estado === 'disponible');

  return (
    <div className="min-h-screen bg-beige-50 p-4 sm:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado y Métricas Rápidas de Caja */}
        <header className="bg-white border border-beige-200 rounded-3xl p-5 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-vino-700 text-white flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-6 h-6 text-beige-100" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-vino-950">
                Panel de Caja & Control del Salón
              </h1>
              <span className="text-xs text-beige-600">
                Gestión en tiempo real de mesas, comandas, reservas y facturación
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsReservationOpen(true)}
              className="btn-outline-celeste text-xs py-2 px-3.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Nueva Reserva</span>
            </button>

            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="btn-outline-vino text-xs py-2 px-3.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Turno Espera</span>
            </button>

            <button
              onClick={loadAllData}
              className="p-2.5 rounded-xl bg-beige-100 text-beige-700 hover:text-vino-800 border border-beige-200"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tarjetas KPI Superiores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-gourmet bg-white p-4">
            <span className="text-xs font-semibold text-beige-600 uppercase">Mesas Ocupadas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-vino-700">
                {mesas.filter((m) => m.estado === 'ocupada').length} / {mesas.length}
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                {mesasLibres.length} libres
              </span>
            </div>
          </div>

          <div className="card-gourmet bg-white p-4">
            <span className="text-xs font-semibold text-beige-600 uppercase">Comandas Activas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-celeste-600">
                {pedidosActivosPorMesa.size}
              </span>
              <span className="text-xs text-beige-600">en cocina/salón</span>
            </div>
          </div>

          <div className="card-gourmet bg-white p-4">
            <span className="text-xs font-semibold text-beige-600 uppercase">Lista de Espera</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-amber-600">
                {listaEspera.filter((l) => l.estado === 'esperando').length}
              </span>
              <span className="text-xs text-beige-600">grupos esperando</span>
            </div>
          </div>

          <div className="card-gourmet bg-white p-4">
            <span className="text-xs font-semibold text-beige-600 uppercase">Total Facturado</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-vino-950">
                Bs. {(resumen?.ingresosTotales || 0).toFixed(2)}
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                {resumen?.pedidosCompletados || 0} cobros
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex items-center gap-2 border-b border-beige-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('salon')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'salon'
                ? 'bg-vino-700 text-white shadow-sm'
                : 'text-beige-700 hover:bg-beige-100 hover:text-vino-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            Salón de Mesas
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'bg-vino-700 text-white shadow-sm'
                : 'text-beige-700 hover:bg-beige-100 hover:text-vino-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Cobro de Pedidos ({pedidosActivosPorMesa.size})
          </button>

          <button
            onClick={() => setActiveTab('reservas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reservas'
                ? 'bg-vino-700 text-white shadow-sm'
                : 'text-beige-700 hover:bg-beige-100 hover:text-vino-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas ({reservas.length})
          </button>

          <button
            onClick={() => setActiveTab('espera')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'espera'
                ? 'bg-vino-700 text-white shadow-sm'
                : 'text-beige-700 hover:bg-beige-100 hover:text-vino-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Lista de Espera ({listaEspera.filter((l) => l.estado === 'esperando').length})
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reportes'
                ? 'bg-vino-700 text-white shadow-sm'
                : 'text-beige-700 hover:bg-beige-100 hover:text-vino-800'
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
              <h2 className="font-serif text-lg font-bold text-vino-950">
                Rotación de Mesas en Salón
              </h2>
              <div className="flex items-center gap-1 bg-white border border-beige-200 p-1 rounded-xl shadow-xs">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'map'
                      ? 'bg-vino-700 text-white shadow-xs'
                      : 'text-beige-600 hover:text-vino-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  Mapa Salón
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-vino-700 text-white shadow-xs'
                      : 'text-beige-600 hover:text-vino-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Lista Detallada
                </button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <FloorMap
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

        {/* CONTENIDO TAB 2: COBRO DE PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="card-gourmet bg-white space-y-4">
            <h2 className="font-serif text-lg font-bold text-vino-950 pb-2 border-b border-beige-200">
              Comandas Activas Pendientes de Cobro
            </h2>

            {pedidosActivosPorMesa.size === 0 ? (
              <div className="text-center py-12 text-beige-500">
                <Receipt className="w-12 h-12 mx-auto text-beige-300 mb-2" />
                <p>No hay mesas con cuentas pendientes por cobrar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(pedidosActivosPorMesa.values()).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-beige-200 bg-beige-50/50 hover:bg-white hover:shadow-warm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-beige-200">
                        <span className="font-serif font-bold text-lg text-vino-950">
                          MESA #{p.numero_mesa || p.mesa_id}
                        </span>
                        <Badge tipo="pedido" estado={p.estado} size="sm" />
                      </div>
                      <div className="py-2.5 space-y-1 text-xs">
                        <div className="text-beige-600">Código: <strong className="text-vino-900 font-mono">#{p.codigo}</strong></div>
                        <div className="text-beige-600">Platos pedidos: <strong>{p.detalles?.length || 0}</strong></div>
                        <div className="text-beige-600">Hora: <strong>{new Date(p.creado_en).toLocaleTimeString()}</strong></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-beige-200 flex items-center justify-between">
                      <span className="font-serif font-bold text-lg text-vino-700">
                        Bs. {p.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPedido(p);
                          setIsBillingOpen(true);
                        }}
                        className="btn-vino text-xs py-2 px-3.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Cobrar Comanda
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 3: RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="card-gourmet bg-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-beige-200">
              <h2 className="font-serif text-lg font-bold text-vino-950">
                Reservaciones de Salón
              </h2>
              <button
                onClick={() => setIsReservationOpen(true)}
                className="btn-celeste text-xs py-2 px-3 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Reserva
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-beige-900">
                <thead className="bg-beige-100/70 text-beige-700 uppercase tracking-wider text-[11px]">
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
                <tbody className="divide-y divide-beige-100">
                  {reservas.map((r) => (
                    <tr key={r.id} className="hover:bg-beige-50/60">
                      <td className="py-3 px-4 font-bold text-vino-950">{r.cliente_nombre}</td>
                      <td className="py-3 px-4 text-beige-600">{r.cliente_telefono}</td>
                      <td className="py-3 px-4 font-bold text-vino-800">Mesa #{r.numero_mesa || r.mesa_id}</td>
                      <td className="py-3 px-4">{r.num_personas} pers.</td>
                      <td className="py-3 px-4 font-mono">{new Date(r.fecha_hora).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-celeste-100 text-celeste-800 border border-celeste-300">
                          {r.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {r.estado === 'pendiente' && (
                          <button
                            onClick={() => handleUpdateReservaEstado(r.id, 'confirmada')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="Confirmar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.estado !== 'cancelada' && (
                          <button
                            onClick={() => handleUpdateReservaEstado(r.id, 'cancelada')}
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
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
          <div className="card-gourmet bg-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-beige-200">
              <h2 className="font-serif text-lg font-bold text-vino-950">
                Lista de Espera y Turnos
              </h2>
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="btn-vino text-xs py-2 px-3 font-bold"
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
                    className="p-4 rounded-2xl border border-beige-200 bg-beige-50/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-beige-200">
                        <span className="font-bold text-base text-vino-950">
                          Turno #{item.posicion} • {item.cliente_nombre}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ~{item.tiempo_estimado_espera} min
                        </span>
                      </div>
                      <div className="py-2 text-xs space-y-1 text-beige-700">
                        <p>Teléfono: <strong>{item.telefono}</strong></p>
                        <p>Grupo: <strong>{item.num_personas} personas</strong></p>
                        {item.notas && <p className="italic text-beige-600">"{item.notas}"</p>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-beige-200">
                      <label className="block text-[11px] font-bold text-beige-700 mb-1">
                        Asignar y sentar en mesa:
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id={`mesa-select-${item.id}`}
                          className="text-xs p-2 rounded-xl border border-beige-300 bg-white flex-1"
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
                          className="btn-celeste text-xs py-2 px-3 font-bold"
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
              <div className="card-gourmet bg-white">
                <h3 className="font-serif text-lg font-bold text-vino-950 mb-3 pb-2 border-b border-beige-200">
                  Desglose por Métodos de Pago
                </h3>
                <div className="space-y-3">
                  {resumen.metodosPago.map((m) => (
                    <div
                      key={m.metodo}
                      className="flex items-center justify-between p-3 rounded-xl bg-beige-50/70 border border-beige-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-bold text-sm text-vino-900">
                          {m.metodo}
                        </span>
                        <span className="text-xs text-beige-600">({m.cantidad} transacciones)</span>
                      </div>
                      <span className="font-serif font-bold text-base text-vino-700">
                        Bs. {m.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Platos Más Vendidos */}
              <div className="card-gourmet bg-white">
                <h3 className="font-serif text-lg font-bold text-vino-950 mb-3 pb-2 border-b border-beige-200">
                  Top 5 Especialidades Más Vendidas
                </h3>
                <div className="space-y-3">
                  {resumen.topProductos.map((p, idx) => (
                    <div
                      key={p.nombre}
                      className="flex items-center justify-between p-3 rounded-xl bg-beige-50/70 border border-beige-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-celeste-600 text-white font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-vino-950 text-sm">{p.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-vino-900 block">{p.cantidad} porciones</span>
                        <span className="text-beige-600">Bs. {p.total.toFixed(2)}</span>
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
