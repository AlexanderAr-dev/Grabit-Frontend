import { FC } from 'react';
import { componentsTheme } from '@constants';
import { Text, useMantineColorScheme } from '@mantine/core';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title = '',
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.pageHeader[colorScheme];

  return (
    <Text
      mt={20}
      mb={20}
      fw={1000}
      ta={'center'}
      style={{
        color: themeStyles.text,
      }}
    >
      <h1>{title}</h1>
    </Text>
  );
};
