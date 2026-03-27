import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import { ProfileProvider } from './ProfileProvider';
import { QueryProvider } from './QueryProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <MantineProvider>
      <BrowserRouter>
        <ProfileProvider>{children}</ProfileProvider>
      </BrowserRouter>
    </MantineProvider>
  </QueryProvider>
);
