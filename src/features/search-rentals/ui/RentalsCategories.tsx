import { FC } from 'react';
import { Group, NumberInput } from '@mantine/core';

import { CategoryTree } from './CategoryTree';

interface FilterBarProps {
  onSortChange?: (value: string | null) => void;
  selectedCategoryId: number | null;
  onCategorySelect: (id: number | null) => void;
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
}

export const RentalsCategories: FC<FilterBarProps> = ({
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
      {/* <Select
        data={sortOptions}
        placeholder="Сортировать по"
        radius="lg"
        onChange={onSortChange}
      /> */}
    </Group>
  );
};
