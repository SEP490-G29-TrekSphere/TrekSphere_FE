import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';
import { AppGlobalLoadingSpinner } from './shared/ui/AppGlobalLoadingSpinner';
import { AppGlobalToast } from './shared/ui/AppToast';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <AppGlobalLoadingSpinner />
      <AppGlobalToast />
    </QueryClientProvider>
  );
}
