import { FC } from 'react';
import { MainLayout } from '@components';
import { MantineProvider } from '@mantine/core';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const App: FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MainLayout />
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
