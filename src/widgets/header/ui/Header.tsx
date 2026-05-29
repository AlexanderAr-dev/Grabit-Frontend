import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Group, Text } from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';

import { useAuth } from '@features/auth';
import { navigationItems } from '@shared/config';
import { List, NavItem, ThemeToggle } from '@shared/ui';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const isActiveItem = (href: string) => location.pathname === href;

  return (
    <Flex align="center" px={16} py={10} style={{ width: '100%', minHeight: 56 }}>
      <Box style={{ flexShrink: 0, minWidth: 140 }}>
        <Text size="lg" style={{ whiteSpace: 'nowrap' }}>
          город:{' '}
          <Text span td="underline" inherit>
            Красноярск
          </Text>
        </Text>
      </Box>

      {/* Навигация — только на десктопе */}
      <Box visibleFrom="sm" style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <List
          align="center"
          direction="horizontal"
          gap={60}
          items={navigationItems}
          renderItem={item => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActiveItem(item.href)}
            />
          )}
        />
      </Box>

      {/* Заглушка-распорка на мобильном, чтобы правая часть прижималась к краю */}
      <Box hiddenFrom="sm" style={{ flex: 1 }} />

      <Box style={{ flexShrink: 0, minWidth: 140 }}>
        <Group justify="flex-end" gap="sm" wrap="nowrap">
          <ThemeToggle />
          <Button
            leftSection={<IconUserCircle size={22} />}
            color="orange"
            px={15}
            py={5}
            bdrs="md"
            onClick={() => isAuthenticated ? navigate('/profile') : login()}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Text size="md" fw={500} c="white">
              {isAuthenticated ? 'Профиль' : 'Войти'}
            </Text>
          </Button>
        </Group>
      </Box>
    </Flex>
  );
};
