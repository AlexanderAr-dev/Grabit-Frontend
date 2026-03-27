export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

export const categories: CategoryNode[] = [
  {
    id: 'tools',
    name: 'Инструменты',
    children: [
      {
        id: 'power_tools',
        name: 'Электроинструменты',
        children: [
          { id: 'drills', name: 'Дрели' },
          { id: 'screwdrivers', name: 'Шуруповерты' },
          { id: 'grinders', name: 'Болгарки' },
        ],
      },
      {
        id: 'hand_tools',
        name: 'Ручные инструменты',
        children: [
          { id: 'hammers', name: 'Молотки' },
          { id: 'saws', name: 'Пилы' },
        ],
      },
    ],
  },
  {
    id: 'transport',
    name: 'Транспорт',
    children: [
      {
        id: 'bikes',
        name: 'Велосипеды',
        children: [
          { id: 'mountain', name: 'Горные' },
          { id: 'city', name: 'Городские' },
        ],
      },
      {
        id: 'scooters',
        name: 'Самокаты',
        children: [
          { id: 'electric', name: 'Электросамокаты' },
          { id: 'kick', name: 'Обычные' },
        ],
      },
    ],
  },
  {
    id: 'electronics',
    name: 'Электроника',
    children: [
      {
        id: 'cameras',
        name: 'Камеры',
        children: [
          { id: 'dslr', name: 'Зеркальные' },
          { id: 'action', name: 'Экшн камеры' },
        ],
      },
    ],
  },
  {
    id: 'sports',
    name: 'Спорт',
    children: [
      {
        id: 'winter',
        name: 'Зимний спорт',
        children: [
          { id: 'skis', name: 'Лыжи' },
          { id: 'snowboards', name: 'Сноуборды' },
        ],
      },
    ],
  },
];
