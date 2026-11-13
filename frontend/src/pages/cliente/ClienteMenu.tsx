import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, Utensils, AlertCircle } from 'lucide-react';
import { Producto, Categoria, CartItem, Pedido } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { CategoryFilter } from '../../components/cliente/CategoryFilter';
import { ProductCard } from '../../components/cliente/ProductCard';
import { CartDrawer } from '../../components/cliente/CartDrawer';
import { OrderTracker } from '../../components/cliente/OrderTracker';

export const ClienteMenu: React.FC = () => {
  const { mesaId = '1' } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  const numericMesaId = parseInt(mesaId, 10) || 1;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Hook WebSocket conectado a la sala de esta mesa
  const { socket } = useSocket({ type: 'mesa', id: numericMesaId });

  // Cargar catálogo y verificar comanda activa de la mesa
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, prodsRes, activoRes] = await Promise.all([
          api.get<Categoria[]>('/categorias'),
          api.get<Producto[]>('/productos/disponibles'),
          api.get<Pedido | null>(`/pedidos/mesa/${numericMesaId}/activo`).catch(() => null),
        ]);

        if (isMounted) {
          setCategorias(catsRes || []);
          setProductos(prodsRes || []);
          setActivePedido(activoRes);
        }
      } catch (err) {
        console.error('Error cargando menú del cliente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [numericMesaId]);

  // Escuchar actualizaciones de estado del pedido en tiempo real vía Socket.io
  useEffect(() => {
    if (!socket) return;

    const handlePedidoEstado = (pedidoActualizado: Pedido) => {
      if (pedidoActualizado.mesa_id === numericMesaId) {
        if (pedidoActualizado.estado === 'pagado' || pedidoActualizado.estado === 'cancelado') {
          // Pedido terminado/pagado: liberar vista
          setActivePedido(null);
        } else {
          setActivePedido(pedidoActualizado);
        }
      }
    };

    socket.on('pedido:estado', handlePedidoEstado);
    socket.on('pedido:nuevo', (nuevoPedido: Pedido) => {
      if (nuevoPedido.mesa_id === numericMesaId) {
        setActivePedido(nuevoPedido);
      }
    });

    return () => {
      socket.off('pedido:estado', handlePedidoEstado);
    };
  }, [socket, numericMesaId]);

  // Manejo de carrito de compras
  const handleAddToCart = (producto: Producto, cantidad: number, notas?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id && item.notas === notas);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id && item.notas === notas
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad, notas }];
    });
  };

  const handleUpdateQuantity = (productoId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === productoId) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productoId: number) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const handleConfirmOrder = async (notasGenerales: string) => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        mesa_id: numericMesaId,
        notas: notasGenerales || undefined,
        items: cart.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          notas: item.notas || undefined,
        })),
      };

      const nuevoPedido = await api.post<Pedido>('/pedidos', payload);
      setActivePedido(nuevoPedido);
      setCart([]);
      setIsCartOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProductos = selectedCategoria
    ? productos.filter((p) => p.categoria_id === selectedCategoria)
    : productos;

  const totalCartCount = cart.reduce((acc, i) => acc + i.cantidad, 0);
  const totalCartPrice = cart.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);

  return (
    <div className="min-h-screen bg-beige-50 pb-24">
      {/* Banner de Bienvenida a la Mesa con Selector Rápido */}
      <section className="bg-gradient-to-r from-vino-900 via-vino-800 to-vino-950 text-white py-8 px-4 sm:px-6 shadow-md border-b-4 border-celeste-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vino-700/80 border border-vino-600 text-xs font-semibold text-beige-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-celeste-400" />
              <span>Experiencia Gastronómica UNICEN</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Carta Digital • Mesa #{numericMesaId}
            </h1>
            <p className="text-xs sm:text-sm text-beige-200 mt-1">
              Ordene cómodamente desde su smartphone. Sus platos se sincronizan al instante con cocina.
            </p>
          </div>

          {/* Selector de mesa para pruebas de simulación */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10 self-start sm:self-auto">
            <span className="text-xs font-medium text-beige-200 pl-2">Cambiar Mesa:</span>
            <select
              value={numericMesaId}
              onChange={(e) => navigate(`/m/${e.target.value}`)}
              className="bg-vino-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-vino-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Mesa {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Contenedor Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Seguimiento de comanda en vivo si existe pedido activo */}
        {activePedido && (
          <OrderTracker pedido={activePedido} />
        )}

        {/* Barra de Filtro de Categorías */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl font-bold text-vino-950 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-vino-700" />
              Nuestras Especialidades
            </h2>
            <span className="text-xs text-beige-600 font-medium">
              {filteredProductos.length} platos disponibles
            </span>
          </div>
          <CategoryFilter
            categorias={categorias}
            selectedId={selectedCategoria}
            onSelect={setSelectedCategoria}
          />
        </div>

        {/* Grilla de Platos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card-gourmet h-72 animate-pulse bg-beige-100/70" />
            ))}
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-16 text-beige-600">
            <AlertCircle className="w-12 h-12 text-beige-300 mx-auto mb-3" />
            <p className="font-semibold text-vino-900">No hay platos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProductos.map((prod) => (
              <ProductCard key={prod.id} producto={prod} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* Botón Flotante de Carrito / Comanda */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 left-0 right-0 max-w-lg mx-auto px-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-vino-700 hover:bg-vino-800 text-white p-4 rounded-2xl shadow-warm-lg flex items-center justify-between font-bold text-sm transition-all hover:scale-[1.02] border-2 border-celeste-400"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-beige-100" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-celeste-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <span className="text-beige-100">Ver Mi Comanda</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-beige-200 block font-normal">Total Estimado</span>
              <span className="font-serif text-lg">Bs. {totalCartPrice.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}

      {/* Drawer del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        mesaNumero={numericMesaId}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onConfirmOrder={handleConfirmOrder}
        submitting={submitting}
      />
    </div>
  );
};
