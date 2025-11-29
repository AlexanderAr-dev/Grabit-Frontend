import { NavItemType } from '@app-types';
import {
  IconClockHour4Filled,
  IconMessageFilled,
  IconPencilPlus,
  IconSearch,
} from '@tabler/icons-react';

export const navigationItems: NavItemType[] = [
  {
    title: 'Поиск',
    icon: IconSearch,
    href: '/',
    color: '#FF8104',
  },
  {
    title: 'Мое',
    icon: IconPencilPlus,
    href: '/my-products',
    color: 'white',
  },
  {
    title: 'Аренда',
    icon: IconClockHour4Filled,
    href: '/rentals-page',
    color: 'white',
  },
  {
    title: 'Чаты',
    icon: IconMessageFilled,
    href: '/chats',
    color: 'white',
  },
];
