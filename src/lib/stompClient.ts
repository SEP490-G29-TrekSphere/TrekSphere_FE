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
  const token = storage.get<string>('accessToken');
  const wsUrl = getWebSocketUrl();

  const client = new Client({

    webSocketFactory: () => new SockJS(wsUrl),

    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },

    // Debug info handler
    debug: () => {},

    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  return client;
};
