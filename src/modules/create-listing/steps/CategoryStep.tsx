import { useState } from 'react';
import {
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { StepProps } from '@modules/create-listing/types/StepProps.ts';

import {
  categories,
  CategoryNode,
} from '../constants/Categories';

const CategoryColumn = ({
  items,
  selectedId,
  onSelect,
}: {
  items: CategoryNode[];
  selectedId?: string;
  onSelect: (item: CategoryNode) => void;
}) => {
  return (
    <Stack>
      {items.map(item => (
        <Paper
          key={item.id}
          p="sm"
          withBorder
          style={{
            cursor: 'pointer',
            background:
              selectedId === item.id
                ? '#f1f3f5'
                : undefined,
          }}
          onClick={() => onSelect(item)}
        >
          <Text>{item.name}</Text>
        </Paper>
      ))}
    </Stack>
  );
};

const CategoryStep = ({
  data,
  updateData,
  next,
  prev,
}: StepProps) => {
  const [level1, setLevel1] = useState<CategoryNode | null>(
    null,
  );
  const [level2, setLevel2] = useState<CategoryNode | null>(
    null,
  );
  const [level3, setLevel3] = useState<CategoryNode | null>(
    null,
  );

  const handleNext = () => {
    if (!level3) return;

    updateData({
      categoryId: level3.id,
    });

    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Выберите категорию</Title>

      <Grid>
        {/* LEVEL 1 */}

        <Grid.Col span={3}>
          <CategoryColumn
            items={categories}
            selectedId={level1?.id}
            onSelect={item => {
              setLevel1(item);
              setLevel2(null);
              setLevel3(null);
            }}
          />
        </Grid.Col>

        {/* LEVEL 2 */}

        <Grid.Col span={3}>
          {level1?.children && (
            <CategoryColumn
              items={level1.children}
              selectedId={level2?.id}
              onSelect={item => {
                setLevel2(item);
                setLevel3(null);
              }}
            />
          )}
        </Grid.Col>

        {/* LEVEL 3 */}

        <Grid.Col span={3}>
          {level2?.children && (
            <CategoryColumn
              items={level2.children}
              selectedId={level3?.id}
              onSelect={item => {
                setLevel3(item);
              }}
            />
          )}
        </Grid.Col>

        {/* SELECTED */}

        <Grid.Col span={3}>
          {level3 && (
            <Paper p="md" withBorder>
              <Text c="dimmed" size="sm">
                Выбрано
              </Text>

              <Text fw={600}>{level3.name}</Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>

      {/* NAVIGATION */}

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={prev}>
          Назад
        </Button>

        <Button disabled={!level3} onClick={handleNext}>
          Далее
        </Button>
      </Group>
    </Stack>
  );
};

export default CategoryStep;
