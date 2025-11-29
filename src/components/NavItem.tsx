import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { NavItemType } from '@app-types';
import { componentsTheme } from '@constants';
import { Group, Text } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

interface NavItemProps extends NavItemType {
  isActive?: boolean;
}

export const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  title,
  href,
  isActive = false,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.navItemTheme[colorScheme];

  const activeColor = themeStyles.active;
  const inactiveColor = isActive
    ? activeColor
    : themeStyles.icon;
  const textColor = isActive
    ? activeColor
    : themeStyles.text;

  return (
    <NavLink to={href} style={{ textDecoration: 'none' }}>
      <Group gap="xs">
        <Icon color={inactiveColor} />
        <Text size="lg" fw={500} c={textColor}>
          {title}
        </Text>
      </Group>
    </NavLink>
  );
};
