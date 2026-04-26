import { FC } from 'react';
import { Button as MantineButton, Group, Select } from '@mantine/core';

interface FilterBarProps {
  onSortChange?: (value: string | null) => void;
  onFilterChange?: (filter: string | null) => void;
  activeFilter?: string | null;
}

export const RentalsCategories: FC<FilterBarProps> = ({
  onSortChange,
  onFilterChange,
  activeFilter = null,
}) => {

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
    { value: 'space', label: 'Помещения' },
  ];

  return (
    <Group
      align="center"
      gap="md"
      style={{ padding: '12px 16px', display: 'flex' }}
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
              activeFilter === filter.value ? '#FF8104' : '#667291',
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
