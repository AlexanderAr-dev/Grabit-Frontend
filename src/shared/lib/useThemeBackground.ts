import { useMantineColorScheme } from '@mantine/core';

import { componentsTheme } from '../config/componentsTheme';

export const useThemeBackground = () => {
  const { colorScheme } = useMantineColorScheme();
  return componentsTheme.background[colorScheme];
};
