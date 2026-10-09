import { useEffect } from 'react';
import { ReactNode } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { createTheme, MantineColorsTuple, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/notifications/styles.css';

import { CityProvider } from '@shared/lib/cityContext';
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

// Dark mode uses dark-blue palette instead of Mantine's default near-black grays
const darkShades: MantineColorsTuple = [
  '#C8D3E1', // 0: primary text
  '#A0ABBE', // 1: secondary text / --mantine-color-dimmed
  '#728098', // 2: dimmed
  '#56687A', // 3: placeholder / icon color
  '#334155', // 4: borders → --mantine-color-default-border
  '#2C3853', // 5: hover state bg
  '#1E293B', // 6: component surface → --mantine-color-default (Paper, Card, Select, Popover)
  '#0F172A', // 7: page body → --mantine-color-body
  '#0B1120', // 8: deeper surfaces (SegmentedControl container)
  '#070D18', // 9: darkest
];

const theme = createTheme({
  primaryColor: 'orange',
  colors: { orange: orangeShades, dark: darkShades },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <BrowserRouter>
        <ScrollToTop />
        <CityProvider>
          <AuthProvider>{children}</AuthProvider>
        </CityProvider>
      </BrowserRouter>
    </MantineProvider>
  </QueryProvider>
);
