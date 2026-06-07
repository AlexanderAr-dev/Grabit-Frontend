import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, MantineColorsTuple, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/notifications/styles.css';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

const orangeShades: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff922b',
  '#FF8104',
  '#e67200',
  '#cc6200',
  '#b35400',
];

const theme = createTheme({
  primaryColor: 'orange',
  colors: { orange: orangeShades },
});

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </QueryProvider>
);
