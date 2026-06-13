import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Indicator, Text, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { IconShieldFilled } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { useIsAdmin } from '@features/admin';
import { useAuth } from '@features/auth';
import { chatService } from '@shared/api';
import { navigationItems } from '@shared/config';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#0F172A' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e5e7eb';
  const activeColor = '#FF8104';
  const inactiveColor = isDark ? '#6b7280' : '#9ca3af';

  const { data: chatUnread = 0 } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatService.getUnreadCount(),
    refetchInterval: 10_000,
    staleTime: 5_000,
    enabled: isAuthenticated,
  });

  return (
    <Box
      hiddenFrom="sm"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: bg,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      {navigationItems.map(item => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
        const color = isActive ? activeColor : inactiveColor;
        const Icon = item.icon;
        const isChat = item.href === '/chats';

        return (
          <UnstyledButton
            key={item.href}
            onClick={() => navigate(item.href)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              paddingBottom: 4,
            }}
          >
            <Indicator
              inline
              disabled={!isChat || chatUnread === 0}
              label={chatUnread > 99 ? '99+' : chatUnread}
              size={16}
              color="red"
              offset={2}
            >
              <Icon size={22} color={color} />
            </Indicator>
            <Text size="xs" fw={isActive ? 600 : 400} style={{ color, lineHeight: 1 }}>
              {item.title}
            </Text>
          </UnstyledButton>
        );
      })}

      {isAdmin && (
        <UnstyledButton
          onClick={() => navigate('/admin')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            paddingBottom: 4,
          }}
        >
          <IconShieldFilled
            size={22}
            color={location.pathname.startsWith('/admin') ? activeColor : inactiveColor}
          />
          <Text
            size="xs"
            fw={location.pathname.startsWith('/admin') ? 600 : 400}
            style={{
              color: location.pathname.startsWith('/admin') ? activeColor : inactiveColor,
              lineHeight: 1,
            }}
          >
            Админ
          </Text>
        </UnstyledButton>
      )}
    </Box>
  );
};
