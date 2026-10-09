import { useLocation, useNavigate } from 'react-router-dom';
import { ActionIcon, Box, Button, Flex, Group, Indicator, Select, Text, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMapPin, IconShieldFilled, IconUserCircle, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { useIsAdmin } from '@features/admin';
import { useAuth } from '@features/auth';
import { chatService } from '@shared/api';
import { navigationItems } from '@shared/config';
import { useCity } from '@shared/lib/cityContext';
import { List, NavItem, NotificationBell, ThemeToggle } from '@shared/ui';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { city, setCity, cities } = useCity();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 576px)');

  const isAdmin = useIsAdmin();
  const isActiveItem = (href: string) => location.pathname === href;

  const { data: chatUnread = 0 } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatService.getUnreadCount(),
    refetchInterval: 10_000,
    staleTime: 5_000,
    enabled: isAuthenticated,
  });

  const cityOptions = cities.map(c => ({ value: c.key, label: c.name }));

  const dropdownBg = isDark ? '#334155' : '#ffffff';
  const dropdownBorder = isDark ? '#475569' : '#E2E8F0';
  const optionColor = isDark ? '#F1F5F9' : '#1E293B';
  const optionHover = isDark ? '#475569' : '#FFF5EB';

  return (
    <Flex align="center" px={16} py={10} style={{ width: '100%', minHeight: 56 }}>
      <Box style={{ flexShrink: 0 }}>
        <Select
          data={cityOptions}
          value={city.key}
          onChange={v => v && setCity(v)}
          searchable
          leftSection={<IconMapPin size={16} color="#fff" />}
          size="sm"
          radius="md"
          w={isMobile ? 130 : 200}
          comboboxProps={{ shadow: 'md' }}
          styles={{
            input: {
              backgroundColor: '#FF8104',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: isMobile ? 13 : 15,
              border: 'none',
              cursor: 'pointer',
              '::placeholder': { color: 'rgba(255,255,255,0.8)' },
            },
            section: { color: '#fff' },
            dropdown: {
              backgroundColor: dropdownBg,
              border: `1px solid ${dropdownBorder}`,
            },
            option: {
              color: optionColor,
              '&[data-hovered]': { backgroundColor: optionHover },
              '&[data-selected]': { backgroundColor: '#FF8104', color: '#fff' },
            },
          }}
        />
      </Box>

      {/* Навигация — только на десктопе */}
      <Box visibleFrom="sm" style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <Group gap={60} align="center" wrap="nowrap">
          <List
            align="center"
            direction="horizontal"
            gap={60}
            items={navigationItems}
            renderItem={item => (
              <Indicator
                key={item.href}
                inline
                disabled={item.href !== '/chats' || chatUnread === 0}
                label={chatUnread > 99 ? '99+' : chatUnread}
                size={16}
                color="red"
                offset={4}
              >
                <NavItem
                  {...item}
                  isActive={isActiveItem(item.href)}
                />
              </Indicator>
            )}
          />
          {isAdmin && (
            <NavItem
              title="Админ"
              href="/admin"
              icon={IconShieldFilled}
              isActive={location.pathname.startsWith('/admin')}
            />
          )}
        </Group>
      </Box>

      {/* Заглушка-распорка на мобильном */}
      <Box hiddenFrom="sm" style={{ flex: 1 }} />

      <Box style={{ flexShrink: 0 }}>
        <Group justify="flex-end" gap="sm" wrap="nowrap">
          <NotificationBell />
          <ThemeToggle />

          {/* Профиль — на мобильном только иконка */}
          {isMobile ? (
            <Box style={{ position: 'relative', display: 'inline-flex' }}>
              <ActionIcon
                size={40}
                radius="md"
                color="orange"
                variant="filled"
                onClick={() => isAuthenticated ? navigate('/profile') : login()}
              >
                <IconUserCircle size={22} />
              </ActionIcon>
              {!isAuthenticated && (
                <Box
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconX size={10} color="#fff" />
                </Box>
              )}
            </Box>
          ) : (
            <Button
              leftSection={<IconUserCircle size={22} />}
              color="orange"
              px={15}
              py={5}
              bdrs="md"
              onClick={() => isAuthenticated ? navigate('/profile') : login()}
              style={{ whiteSpace: 'nowrap', minWidth: 140 }}
            >
              <Text size="md" fw={500} c="white">
                {isAuthenticated ? 'Профиль' : 'Войти'}
              </Text>
            </Button>
          )}
        </Group>
      </Box>
    </Flex>
  );
};
