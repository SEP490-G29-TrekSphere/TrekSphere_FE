import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
