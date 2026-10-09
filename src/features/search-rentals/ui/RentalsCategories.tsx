import { FC } from 'react';
import { Group, NumberInput, Select } from '@mantine/core';

import { CategoryTree } from './CategoryTree';

interface FilterBarProps {
  onSortChange: (value: string | null) => void;
  sortValue: string | null;
  selectedCategoryId: number | null;
  onCategorySelect: (id: number | null) => void;
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
}

const SORT_OPTIONS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'old', label: 'Сначала старые' },
  { value: 'cheap', label: 'Сначала дешёвые' },
  { value: 'expensive', label: 'Сначала дорогие' },
  { value: 'popular', label: 'По популярности' },
  { value: 'highRating', label: 'Высокий рейтинг' },
  { value: 'lowRating', label: 'Низкий рейтинг' },
];

export const RentalsCategories: FC<FilterBarProps> = ({
  onSortChange,
  sortValue,
  selectedCategoryId,
  onCategorySelect,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) => {
  return (
    <Group align="center" gap="sm" wrap="wrap" justify="center">
      <CategoryTree selectedCategoryId={selectedCategoryId} onSelect={onCategorySelect} />
      <NumberInput
        placeholder="От ₽/ч"
        radius="lg"
        w={110}
        min={0}
        value={minPrice ?? ''}
        onChange={v => onMinPriceChange(v === '' ? undefined : Number(v))}
        hideControls
      />
      <NumberInput
        placeholder="До ₽/ч"
        radius="lg"
        w={110}
        min={0}
        value={maxPrice ?? ''}
        onChange={v => onMaxPriceChange(v === '' ? undefined : Number(v))}
        hideControls
      />
      <Select
        data={SORT_OPTIONS}
        value={sortValue}
        placeholder="Сортировка"
        radius="lg"
        w={180}
        clearable
        onChange={onSortChange}
      />
    </Group>
  );
};
