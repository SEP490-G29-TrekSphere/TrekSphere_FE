import { useNotificationSocket } from '../hooks/useNotificationSocket';

export default function NotificationSocketMount() {
  useNotificationSocket();
  return null;
}
