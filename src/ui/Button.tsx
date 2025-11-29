import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

interface ButtonProps
  extends Omit<MantineButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  isLoading,
  children,
  style,
  type = 'button',
  ...props
}) => {
  const { colorScheme } = useMantineColorScheme();

  const themeStyles =
    componentsTheme.buttonTheme[colorScheme];
  const variantStyles = themeStyles[variant];

  return (
    <MantineButton
      type={type}
      loading={isLoading}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        ...style,
      }}
      {...props}
    >
      {children}
    </MantineButton>
  );
};
