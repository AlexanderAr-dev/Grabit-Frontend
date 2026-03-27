import { FC } from 'react';
import {
  TextInput as MantineTextInput,
  TextInputProps as MantineTextInputProps,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import { componentsTheme } from '@shared/config';

interface SearchInputProps
  extends Omit<MantineTextInputProps, 'rightSection' | 'styles'> {
  variant?: 'primary';
  isLoading?: boolean;
}

export const SearchInput: FC<SearchInputProps> = ({
  variant = 'primary',
  isLoading,
  style,
  ...props
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles = componentsTheme.searchInput[colorScheme];
  const variantStyles = themeStyles[variant];

  return (
    <MantineTextInput
      rightSection={<IconSearch size={18} color={variantStyles.iconColor} />}
      placeholder="Поиск вещи/помещения/услуги"
      radius="xl"
      size="lg"
      w={600}
      styles={{
        input: {
          backgroundColor: variantStyles.backgroundColor,
          color: variantStyles.color,
          borderColor: variantStyles.borderColor,
        },
      }}
      disabled={isLoading}
      style={style}
      {...props}
    />
  );
};
