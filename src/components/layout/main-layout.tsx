import { Header } from '@components/layout/components/Header.tsx';
import { routes } from '@constants/routes.tsx';
import { useThemeBackground } from '@hooks/useThemeBackground.ts';
import { AppShell, Container } from '@mantine/core';

import { Routing } from '../../app/router/Routing.tsx';

export const MainLayout = () => {
  const background = useThemeBackground();
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header
        style={{ backgroundColor: background.primary }}
      >
        <Header />
      </AppShell.Header>
      <AppShell.Main
        style={{ backgroundColor: background.primary }}
      >
        <Container size={800}>
          <Routing routes={routes} />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
