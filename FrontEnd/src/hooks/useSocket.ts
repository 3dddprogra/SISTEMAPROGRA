import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

export function useSocket(room?: { type: 'mesa' | 'cocina' | 'caja'; id?: number | string }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      if (room) {
        if (room.type === 'mesa' && room.id) {
          socket.emit('unirse:mesa', room.id);
        } else if (room.type === 'cocina') {
          socket.emit('unirse:cocina');
        } else if (room.type === 'caja') {
          socket.emit('unirse:caja');
        }
      }
    };

    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [room?.type, room?.id]);

  return { socket: getSocket(), isConnected };
}
