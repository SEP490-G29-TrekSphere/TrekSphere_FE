import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { storage } from '@/utils/storage';

export const getWebSocketUrl = (): string => {
  const isDev = import.meta.env.DEV;
  if (isDev) {
    return '/ws';
  }

  const rawUrl = import.meta.env.VITE_API_URL || 'https://api.treksphere.io.vn';
  const rootUrl = rawUrl.replace(/\/api(\/v\d+)?\/?$/, '');
  return `${rootUrl}/ws`;
};

export const createStompClient = (): Client => {
  const wsUrl = getWebSocketUrl();

  const client = new Client({
    webSocketFactory: () => new SockJS(wsUrl),

    // Lấy token mới nhất trước mỗi lần kết nối
    beforeConnect: () => {
      const token = storage.get<string>('accessToken');
      client.connectHeaders = {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },

    // Debug info handler
    debug: () => {},

    // Cấu hình reconnect và heartbeat đồng bộ với backend (10 giây)
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  return client;
};
