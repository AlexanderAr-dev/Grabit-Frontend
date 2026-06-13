import { AppShell, Group, NavLink, ScrollArea, Text, Title, UnstyledButton } from '@mantine/core';
import {
  IconArrowLeft,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconList,
  IconLogout,
  IconStar,
  IconUsers,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AuthService } from '@shared/api';

const NAV_ITEMS = [
  { label: 'Дашборд', path: '/admin', icon: IconChartBar },
  { label: 'Пользователи', path: '/admin/users', icon: IconUsers },
  { label: 'Объявления', path: '/admin/listings', icon: IconList },
  { label: 'Бронирования', path: '/admin/bookings', icon: IconCalendar },
  { label: 'Отзывы', path: '/admin/reviews', icon: IconStar },
  { label: 'Категории', path: '/admin/categories', icon: IconCategory },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const url = await AuthService.logout();
      if (url) await fetch(url, { mode: 'no-cors' }).catch(() => {});
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  return (
    <AppShell
      navbar={{ width: 220, breakpoint: 'xs' }}
      padding="xl"
      styles={{
        navbar: { backgroundColor: '#1c1c2e', borderColor: '#2a2a40' },
        main: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
      }}
    >
      <AppShell.Navbar p="xs" style={{ display: 'flex', flexDirection: 'column' }}>
        <Group mb="lg" mt="sm" px="xs">
          <Title order={5} c="white">
            Grabit Admin
          </Title>
        </Group>
        <ScrollArea flex={1}>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<item.icon size={16} stroke={1.5} />}
                active={isActive}
                onClick={() => navigate(item.path)}
                mb={2}
                color="orange"
                styles={{
                  root: {
                    borderRadius: 8,
                    color: isActive ? 'white' : '#9090b0',
                  },
                  label: { fontSize: 14 },
                }}
              />
            );
          })}
        </ScrollArea>
        <UnstyledButton
          onClick={() => navigate('/')}
          p="sm"
          style={{
            borderRadius: 8,
            color: '#9090b0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconArrowLeft size={16} />
          <Text size="sm">На сайт</Text>
        </UnstyledButton>
        <UnstyledButton
          onClick={handleLogout}
          p="sm"
          style={{
            borderRadius: 8,
            color: '#9090b0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconLogout size={16} />
          <Text size="sm">Выйти</Text>
        </UnstyledButton>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
