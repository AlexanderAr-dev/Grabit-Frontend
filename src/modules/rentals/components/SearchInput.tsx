import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  TextInput as MantineTextInput,
  TextInputProps as MantineTextInputProps,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchInputProps
  extends Omit<
    MantineTextInputProps,
    'rightSection' | 'styles'
  > {
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

  const themeStyles =
    componentsTheme.searchInput[colorScheme];
  const variantStyles = themeStyles[variant];

  return (
    <MantineTextInput
      rightSection={
        <IconSearch
          size={18}
          color={variantStyles.iconColor}
        />
      }
      placeholder="Поиск вещи/помещения/услуги"
      radius="xl"
      size="lg"
      w={600}
      styles={{
        input: {
          backgroundColor: variantStyles.backgroundColor,
          color: variantStyles.color,
          borderColor: variantStyles.borderColor,
          '&:focus': {
            borderColor: variantStyles.focusBorderColor,
          },
          '&::placeholder': {
            color: variantStyles.placeholderColor,
          },
        },
      }}
      disabled={isLoading}
      style={style}
      {...props}
    />
  );
};
