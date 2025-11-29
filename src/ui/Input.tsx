import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  PasswordInput,
  PasswordInputProps,
  Text,
  Textarea,
  TextareaProps,
  TextInput as MantineInput,
  TextInputProps as MantineInputProps,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

interface InputProps
  extends Omit<MantineInputProps, 'styles'> {
  variant?: 'default' | 'filled' | 'unstyled';
  type?: 'text' | 'password' | 'textarea';
  label?: string;
}

export const Input: FC<InputProps> = ({
  variant = 'default',
  type = 'text',
  label = '',
  ...props
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.inputTheme[colorScheme];

  const baseStyles = {
    input: {
      backgroundColor: themeStyles.backgroundColor,
      color: '#000000', // Черный текст всегда в инпуте
    },
    label: {
      color: themeStyles.text, // Лейбл меняет цвет по теме
    },
  };

  switch (type) {
    case 'password':
      return (
        <PasswordInput
          variant={variant}
          styles={baseStyles}
          {...(props as PasswordInputProps)}
          label={
            label ? (
              <Text size="lg">{label}</Text>
            ) : undefined
          }
        />
      );

    case 'textarea':
      return (
        <Textarea
          variant={variant}
          styles={baseStyles}
          {...(props as TextareaProps)}
          label={
            label ? (
              <Text size="lg">{label}</Text>
            ) : undefined
          }
        />
      );

    default:
      return (
        <MantineInput
          variant={variant}
          styles={baseStyles}
          label={
            label ? (
              <Text size="lg">{label}</Text>
            ) : undefined
          }
          {...props}
        />
      );
  }
};
