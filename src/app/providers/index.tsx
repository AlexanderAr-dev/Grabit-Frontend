import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <MantineProvider>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </QueryProvider>
);
