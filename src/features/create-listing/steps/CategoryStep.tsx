import { useState } from 'react';
import {
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';

import {
  categories,
  CategoryNode,
} from '../model/constants/Categories';
import { StepProps } from '../model/types/StepProps';

const CategoryColumn = ({
  items,
  selectedId,
  onSelect,
  isDark,
}: {
  items: CategoryNode[];
  selectedId?: string;
  onSelect: (item: CategoryNode) => void;
  isDark: boolean;
}) => (
  <Stack gap={6}>
    {items.map(item => (
      <Paper
        key={item.id}
        p="sm"
        withBorder
        style={{
          cursor: 'pointer',
          background: selectedId === item.id
            ? isDark ? '#FF8104' : '#FFF0E0'
            : isDark ? '#1E293B' : undefined,
          borderColor: selectedId === item.id ? '#FF8104' : undefined,
        }}
        onClick={() => onSelect(item)}
      >
        <Text fw={selectedId === item.id ? 600 : 400}>{item.name}</Text>
      </Paper>
    ))}
  </Stack>
);

const CategoryStep = ({ updateData, next, prev }: StepProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [level1, setLevel1] = useState<CategoryNode | null>(null);
  const [level2, setLevel2] = useState<CategoryNode | null>(null);
  const [level3, setLevel3] = useState<CategoryNode | null>(null);

  const handleNext = () => {
    if (!level3) return;
    updateData({ categoryId: level3.id as unknown as number });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Выберите категорию</Title>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Text size="xs" c="dimmed" mb={6} fw={600}>Раздел</Text>
          <CategoryColumn
            items={categories}
            selectedId={level1?.id}
            onSelect={item => { setLevel1(item); setLevel2(null); setLevel3(null); }}
            isDark={isDark}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          {level1?.children && (
            <>
              <Text size="xs" c="dimmed" mb={6} fw={600}>Категория</Text>
              <CategoryColumn
                items={level1.children}
                selectedId={level2?.id}
                onSelect={item => { setLevel2(item); setLevel3(null); }}
                isDark={isDark}
              />
            </>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          {level2?.children && (
            <>
              <Text size="xs" c="dimmed" mb={6} fw={600}>Подкатегория</Text>
              <CategoryColumn
                items={level2.children}
                selectedId={level3?.id}
                onSelect={item => setLevel3(item)}
                isDark={isDark}
              />
            </>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          {level3 && (
            <Paper p="md" withBorder style={{ background: isDark ? '#1E293B' : undefined }}>
              <Text c="dimmed" size="sm">Выбрано</Text>
              <Text fw={600}>{level3.name}</Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={prev}>Назад</Button>
        <Button disabled={!level3} onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default CategoryStep;
