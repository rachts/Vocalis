import { Socket } from 'socket.io';
import WebSocket from 'ws';
import { getDeepgramConfig } from '../services/deepgram';

export function handleSTTConnection(socket: Socket) {
  let deepgramLive: WebSocket | null = null;

  socket.on('start-stt', () => {
    if (deepgramLive) return;

    try {
      const dgConfig = getDeepgramConfig();
      
      deepgramLive = new WebSocket(dgConfig.url, {
        headers: dgConfig.headers
      });

      deepgramLive.on('open', () => {
        console.log(`Deepgram connection opened for client ${socket.id}`);
        socket.emit('stt-ready');
      });

      deepgramLive.on('message', (data: WebSocket.Data) => {
        try {
          // deepgram returns a buffer or string
          const response = JSON.parse(data.toString());
          if (response.channel && response.channel.alternatives && response.channel.alternatives.length > 0) {
            const transcript = response.channel.alternatives[0].transcript;
            const isFinal = response.is_final;
            if (transcript) {
              socket.emit('transcript', { text: transcript, isFinal });
            }
          }
        } catch (e) {
          console.error('Error parsing Deepgram message', e);
        }
      });

      deepgramLive.on('close', () => {
        console.log(`Deepgram connection closed for client ${socket.id}`);
        deepgramLive = null;
      });

      deepgramLive.on('error', (err) => {
        console.error('Deepgram error:', err);
        socket.emit('stt-error', 'Deepgram connection error');
      });

    } catch (err: any) {
      socket.emit('stt-error', err.message || 'Failed to initialize Deepgram');
    }
  });

  socket.on('audio-data', (data) => {
    if (deepgramLive && deepgramLive.readyState === WebSocket.OPEN) {
      deepgramLive.send(data);
    }
  });

  socket.on('stop-stt', () => {
    if (deepgramLive) {
      deepgramLive.close();
      deepgramLive = null;
    }
  });

  socket.on('disconnect', () => {
    if (deepgramLive) {
      deepgramLive.close();
      deepgramLive = null;
    }
  });
}
