import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from '../api/config';

let socketInstance: Socket | null = null;

export function getSocketConnection(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
}

export function subscribeToBarbersipSocket(handler: (event: any) => void): () => void {
  const socket = getSocketConnection();

  const onEvent = (event: any) => {
    handler(event);
  };

  socket.on('booking_created', onEvent);
  socket.on('booking_updated', onEvent);
  socket.on('booking_status_updated', onEvent);
  socket.on('member_updated', onEvent);
  socket.on('point_updated', onEvent);

  return () => {
    socket.off('booking_created', onEvent);
    socket.off('booking_updated', onEvent);
    socket.off('booking_status_updated', onEvent);
    socket.off('member_updated', onEvent);
    socket.off('point_updated', onEvent);
  };
}
