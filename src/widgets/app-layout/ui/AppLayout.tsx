import { AppShell, Box, Container } from '@mantine/core';

import { routes } from '@shared/config/routes';
import { useThemeBackground } from '@shared/lib';
import { Routing } from '@app/router/Routing';
import { ProfileCompleteModal } from '@features/auth/ui/ProfileCompleteModal';
import { BottomNav } from '@widgets/bottom-nav';
import { Header } from '@widgets/header';

export const AppLayout = () => {
  const background = useThemeBackground();

  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header style={{ backgroundColor: background.primary }}>
        <Header />
      </AppShell.Header>
      <AppShell.Main style={{ backgroundColor: background.primary, paddingLeft: 0, paddingRight: 0 }}>
        <Container size={865} px={{ base: 12, sm: 0 }}>
          <Routing routes={routes} />
        </Container>
        {/* отступ под нижнюю панель на мобильном */}
        <Box hiddenFrom="sm" style={{ height: 'calc(60px + env(safe-area-inset-bottom, 0px))' }} />
      </AppShell.Main>
      <BottomNav />
      <ProfileCompleteModal />
    </AppShell>
  );
};
