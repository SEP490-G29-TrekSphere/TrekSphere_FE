import { useNotificationSocket } from '../hooks/useNotificationSocket';

/** Component vô hình — chỉ để mount `useNotificationSocket()` 1 lần gần app root. */
export default function NotificationSocketMount() {
  useNotificationSocket();
  return null;
}
