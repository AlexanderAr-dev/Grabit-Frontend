import { FC } from 'react';
import { Box, Button, Drawer, Flex, Group, NumberInput, Select, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconList, IconMap } from '@tabler/icons-react';

import { CategoryTree } from './CategoryTree';

type ViewMode = 'list' | 'map';

const SORT_OPTIONS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'old', label: 'Сначала старые' },
  { value: 'cheap', label: 'Сначала дешёвые' },
  { value: 'expensive', label: 'Сначала дорогие' },
  { value: 'popular', label: 'По популярности' },
  { value: 'highRating', label: 'Высокий рейтинг' },
  { value: 'lowRating', label: 'Низкий рейтинг' },
];

interface FilterDrawerProps {
  opened: boolean;
  onClose: () => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  sortValue: string | null;
  onSortChange: (value: string | null) => void;
  selectedCategoryId: number | null;
  onCategorySelect: (id: number | null) => void;
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
  onReset: () => void;
}

export const FilterDrawer: FC<FilterDrawerProps> = ({
  opened,
  onClose,
  mode,
  onModeChange,
  sortValue,
  onSortChange,
  selectedCategoryId,
  onCategorySelect,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) => {
  const hasActiveFilters =
    selectedCategoryId != null || sortValue != null || minPrice != null || maxPrice != null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      title="Фильтры"
      radius="lg"
      styles={{
        content: { borderRadius: '16px 16px 0 0' },
        title: { fontWeight: 700, fontSize: 18 },
      }}
    >
      <Stack gap="lg" pb="md">
        {/* Вид отображения */}
        <Box>
          <Text size="sm" fw={600} mb={8} c="dimmed">Вид</Text>
          <Flex
            style={{
              border: '1.5px solid var(--mantine-color-default-border)',
              borderRadius: 10,
              overflow: 'hidden',
              width: '100%',
            }}
          >
            {(['list', 'map'] as ViewMode[]).map((m, i) => (
              <UnstyledButton
                key={m}
                onClick={() => { onModeChange(m); sessionStorage.setItem('rentals_view_mode', m); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  color: mode === m ? '#fff' : 'var(--mantine-color-dimmed)',
                  background: mode === m ? '#FF8104' : 'var(--mantine-color-body)',
                  borderRight: i === 0 ? '1.5px solid var(--mantine-color-default-border)' : undefined,
                  transition: 'background 0.15s, color 0.15s',
                  cursor: 'pointer',
                }}
              >
                {m === 'list' ? <IconList size={16} /> : <IconMap size={16} />}
                {m === 'list' ? 'Список' : 'На карте'}
              </UnstyledButton>
            ))}
          </Flex>
        </Box>

        {/* Категория */}
        <Box>
          <Text size="sm" fw={600} mb={8} c="dimmed">Категория</Text>
          <CategoryTree selectedCategoryId={selectedCategoryId} onSelect={onCategorySelect} />
        </Box>

        {/* Цена */}
        <Box>
          <Text size="sm" fw={600} mb={8} c="dimmed">Цена (₽/ч)</Text>
          <Group gap="sm">
            <NumberInput
              placeholder="От"
              radius="lg"
              style={{ flex: 1 }}
              min={0}
              value={minPrice ?? ''}
              onChange={v => onMinPriceChange(v === '' ? undefined : Number(v))}
              hideControls
            />
            <NumberInput
              placeholder="До"
              radius="lg"
              style={{ flex: 1 }}
              min={0}
              value={maxPrice ?? ''}
              onChange={v => onMaxPriceChange(v === '' ? undefined : Number(v))}
              hideControls
            />
          </Group>
        </Box>

        {/* Сортировка */}
        <Box>
          <Text size="sm" fw={600} mb={8} c="dimmed">Сортировка</Text>
          <Select
            data={SORT_OPTIONS}
            value={sortValue}
            placeholder="По умолчанию"
            radius="lg"
            clearable
            onChange={onSortChange}
          />
        </Box>

        {/* Кнопки */}
        <Group gap="sm">
          {hasActiveFilters && (
            <Button
              variant="default"
              radius="xl"
              style={{ flex: 1 }}
              onClick={onReset}
            >
              Сбросить
            </Button>
          )}
          <Button
            color="orange"
            radius="xl"
            style={{ flex: hasActiveFilters ? 1 : undefined, width: hasActiveFilters ? undefined : '100%' }}
            onClick={onClose}
          >
            Применить
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
};
