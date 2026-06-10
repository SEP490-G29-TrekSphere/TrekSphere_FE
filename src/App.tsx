import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';
import { AppGlobalLoadingSpinner } from './shared/ui/AppGlobalLoadingSpinner';
import { AppGlobalToast } from './shared/ui/AppToast';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <AppGlobalLoadingSpinner />
      <AppGlobalToast />
    </QueryClientProvider>
  );
};

export default App;
