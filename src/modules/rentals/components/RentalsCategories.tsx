import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  Button as MantineButton,
  Group,
  Select,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

interface FilterBarProps {
  variant?: 'primary';
  onSortChange?: (value: string | null) => void;
  onFilterChange?: (filter: string | null) => void;
  activeFilter?: string | null;
}

export const RentalsCategories: FC<FilterBarProps> = ({
  variant = 'primary',
  onSortChange,
  onFilterChange,
  activeFilter = null,
  ...props
}) => {
  const { colorScheme } = useMantineColorScheme();

  const themeStyles =
    componentsTheme.filterBarTheme[colorScheme];
  const variantStyles = themeStyles[variant];

  const sortOptions = [
    { value: 'date', label: 'Дата' },
    { value: 'price_asc', label: 'Дешевле' },
    { value: 'price_desc', label: 'Дороже' },
    { value: 'popular', label: 'Популярное' },
  ];

  const filterButtons = [
    { value: null, label: 'Все' },
    { value: 'product', label: 'Вещи' },
    { value: 'service', label: 'Услуги' },
    { value: 'premises', label: 'Помещения' },
  ];

  return (
    <Group
      align="center"
      gap="md"
      style={{
        padding: '12px 16px',
        display: 'flex',
      }}
      {...props}
    >
      <Select
        data={sortOptions}
        placeholder="Сортировать по"
        radius="lg"
        onChange={onSortChange}
      />

      {filterButtons.map(filter => (
        <MantineButton
          key={String(filter.value)}
          radius="lg"
          onClick={() => onFilterChange?.(filter.value)}
          style={{
            backgroundColor:
              activeFilter === filter.value
                ? '#FF8104'
                : '#667291',
            color: '#FFFFFF',
            fontWeight: 500,
          }}
        >
          {filter.label}
        </MantineButton>
      ))}
    </Group>
  );
};
