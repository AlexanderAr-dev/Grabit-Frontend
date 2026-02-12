import { FC } from 'react';
import { MainLayout } from '@components';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const App: FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
    </QueryClientProvider>
  );
};

export default App;
