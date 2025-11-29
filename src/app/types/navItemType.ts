import { FC } from 'react';

interface IconProps {
  size?: number | string;
  stroke?: number | string;
  color?: string;
  [key: string]: unknown;
}

export type NavItemType = {
  title: string;
  href: string;
  icon: FC<IconProps>;
  color?: string;
  isActive?: boolean;
};
