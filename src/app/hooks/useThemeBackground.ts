import { componentsTheme } from '@constants';
import { useMantineColorScheme } from '@mantine/core';

export const useThemeBackground = () => {
  const { colorScheme } = useMantineColorScheme();
  return componentsTheme.background[colorScheme];
};
