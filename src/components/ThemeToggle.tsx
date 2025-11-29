import { ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } =
    useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Tooltip
      label={isDark ? 'Светлая тема' : 'Темная тема'}
    >
      <ActionIcon
        onClick={toggleTheme}
        size="lg"
        variant={'outline'}
        color={'#EA9432'}
      >
        {isDark ? (
          <IconSun size={18} />
        ) : (
          <IconMoon size={18} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};
