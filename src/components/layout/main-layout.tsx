import { Header } from '@components/layout/components/Header.tsx';
import { routes } from '@constants/routes.tsx';
import { AppShell, Container } from '@mantine/core';

import { Routing } from '../../app/router/Routing.tsx';

export const MainLayout = () => {
  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header bg={'#0F172A'}>
        {/*<Burger*/}
        {/*  opened={opened}*/}
        {/*  onClick={toggle}*/}
        {/*  hiddenFrom="sm"*/}
        {/*  size="sm"*/}
        {/*/>*/}
        <Header />
      </AppShell.Header>
      <AppShell.Main bg={'#0F172A'}>
        <Container size={800}>
          <Routing routes={routes} />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
