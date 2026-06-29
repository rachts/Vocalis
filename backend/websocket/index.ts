import { Server } from 'socket.io';
import { handleSTTConnection } from './sttHandler';

export function registerSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Register STT handlers for this socket
    handleSTTConnection(socket);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
