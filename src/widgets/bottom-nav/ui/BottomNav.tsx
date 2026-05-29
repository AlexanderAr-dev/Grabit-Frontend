import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Text, UnstyledButton, useMantineColorScheme } from '@mantine/core';

import { navigationItems } from '@shared/config';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#0F172A' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e5e7eb';
  const activeColor = '#FF8104';
  const inactiveColor = isDark ? '#6b7280' : '#9ca3af';

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
        const isActive = location.pathname === item.href;
        const color = isActive ? activeColor : inactiveColor;
        const Icon = item.icon;

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
            <Icon size={22} color={color} />
            <Text size="xs" fw={isActive ? 600 : 400} style={{ color, lineHeight: 1 }}>
              {item.title}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );
};
