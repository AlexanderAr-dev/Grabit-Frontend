import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  Text,
  TextProps as MantineTextProps,
  useMantineColorScheme,
} from '@mantine/core';

interface LabelProps extends MantineTextProps {
  title: string;
}

export const Label: FC<LabelProps> = ({ title = '', ...props }) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.pageHeader[colorScheme];

  return (
    <Text
      ta={'center'}
      size={'xl'}
      style={{
        color: themeStyles.text,
      }}
      {...props}
    >
      {title}
    </Text>
  );
};
