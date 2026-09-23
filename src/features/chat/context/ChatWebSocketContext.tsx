import type { Client } from '@stomp/stompjs';
import type React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createStompClient } from '@/lib/stompClient';
import { useAppStore } from '@/store/useAppStore';

interface ChatWebSocketContextType {
  client: Client | null;
  isConnected: boolean;
  connectionEpoch: number;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType>({
  client: null,
  isConnected: false,
  connectionEpoch: 0,
});

export const useChatWebSocket = () => useContext(ChatWebSocketContext);

export const ChatWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionEpoch, setConnectionEpoch] = useState(0);
  const userId = useAppStore((state) => state.user?.id);
  const prevUserIdRef = useRef<string | undefined>(userId);

  useEffect(() => {
    const stompClient = createStompClient();

    stompClient.onConnect = () => {
      setIsConnected(true);
      setConnectionEpoch((prev) => prev + 1);
      if (import.meta.env.DEV) {
        console.log('[STOMP] Connected to WebSocket');
      }
    };

    stompClient.onWebSocketClose = (event) => {
      setIsConnected(false);
      if (import.meta.env.DEV) {
        console.log('[STOMP] WebSocket Closed:', event);
      }
    };

    stompClient.onDisconnect = () => {
      setIsConnected(false);
    };

    stompClient.onWebSocketError = (error) => {
      console.error('[STOMP] WebSocket Error:', error);
    };

    stompClient.onStompError = (frame) => {
      console.error('[STOMP] Broker Error:', frame.headers.message, frame.body);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      setIsConnected(false);
    };
  }, []);

  // Khi user đăng nhập, đăng xuất hoặc đổi tài khoản -> refresh lại STOMP connection
  useEffect(() => {
    if (prevUserIdRef.current !== userId && client) {
      prevUserIdRef.current = userId;
      if (import.meta.env.DEV) {
        console.log('[STOMP] User auth changed, refreshing connection');
      }
      client.deactivate().then(() => {
        client.activate();
      });
    }
  }, [userId, client]);

  return (
    <ChatWebSocketContext.Provider value={{ client, isConnected, connectionEpoch }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};
