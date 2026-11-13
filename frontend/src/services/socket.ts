import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Conexión relativa para que funcione automáticamente con Nginx o proxy de Vite sin IPs en el código
    socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('🟢 [Socket.io] Conectado al servidor con ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔴 [Socket.io] Desconectado del servidor:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ [Socket.io] Error de conexión:', error.message);
    });
  }

  return socket;
}

export function unirseASalaMesa(mesaId: number | string): void {
  const s = getSocket();
  s.emit('unirse:mesa', mesaId);
}

export function unirseASalaCocina(): void {
  const s = getSocket();
  s.emit('unirse:cocina');
}

export function unirseASalaCaja(): void {
  const s = getSocket();
  s.emit('unirse:caja');
}
