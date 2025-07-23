import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Use localhost for development

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only create socket connection if we're in development and server is likely running
    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        forceNew: true,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('✅ Connected to server:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
      });

      socket.on('connect_error', (error) => {
        console.log('⚠️ Connection error (this is normal if server is not running):', error.message);
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (error) {
      console.log('Socket initialization failed (server may not be running):', error);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  return socketRef.current;
};