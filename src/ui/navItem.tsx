import { NavItemType } from '@app-types';
import { Group, Text } from '@mantine/core';

export const NavItem = ({
  icon: Icon,
  title,
  color,
}: NavItemType) => {
  return (
    <Group gap="xs">
      <Icon color={color} />
      <Text size={'lg'} fw={500} c={color}>{title}</Text>
    </Group>
  );
};
