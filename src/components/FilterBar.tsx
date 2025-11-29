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
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

export const FilterBar: FC<FilterBarProps> = ({
  variant = 'primary',
  onSortChange,
  onFilterChange,
  activeFilter = 'all',
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
    { value: 'all', label: 'Все' },
    { value: 'things', label: 'Вещи' },
    { value: 'services', label: 'Услуги' },
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
        placeholder={'Сортировать по'}
        radius="lg"
        styles={{
          input: {
            backgroundColor: '#FF8104', // Жестко заданный оранжевый
            color: '#FFFFFF', // Жестко заданный белый
            border: 'none',
            fontWeight: 500,
            '&::placeholder': {
              color: 'rgba(255,255,255,0.9)',
            },
            '&:focus': {
              backgroundColor: '#E5670A', // Темнее оранжевый
              border: 'none',
            },
          },
          dropdown: {
            backgroundColor:
              variantStyles.select.dropdownBackgroundColor,
            border: `1px solid ${variantStyles.select.dropdownBorderColor}`,
          },
          option: {
            color: variantStyles.select.optionColor,
            '&:hover': {
              backgroundColor:
                variantStyles.select
                  .optionHoverBackgroundColor,
            },
            '&[data-selected]': {
              backgroundColor: '#FF8104', // Оранжевый для выбранного
              color: '#FFFFFF', // Белый для выбранного
              '&:hover': {
                backgroundColor: '#FF8104',
              },
            },
          },
        }}
        onChange={onSortChange}
      />

      {filterButtons.map(filter => (
        <MantineButton
          key={filter.value}
          radius="lg"
          onClick={() => onFilterChange?.(filter.value)}
          style={{
            backgroundColor:
              activeFilter === filter.value
                ? '#FF8104'
                : '#667291',
            color: '#FFFFFF',
            fontWeight: 500,
            '&:hover': {
              backgroundColor:
                activeFilter === filter.value
                  ? '#E5670A'
                  : '#5A6680',
            },
          }}
        >
          {filter.label}
        </MantineButton>
      ))}
    </Group>
  );
};
