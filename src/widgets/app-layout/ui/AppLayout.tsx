import { AppShell, Container } from '@mantine/core';

import { routes } from '@shared/config/routes';
import { useThemeBackground } from '@shared/lib';
import { Routing } from '@app/router/Routing';
import { Header } from '@widgets/header';

export const AppLayout = () => {
  const background = useThemeBackground();

  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header style={{ backgroundColor: background.primary }}>
        <Header />
      </AppShell.Header>
      <AppShell.Main style={{ backgroundColor: background.primary }}>
        <Container size={865}>
          <Routing routes={routes} />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
