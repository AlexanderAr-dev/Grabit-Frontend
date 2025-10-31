import { CSSProperties, ReactNode } from 'react';
import { Group, Stack } from '@mantine/core';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  direction?: 'horizontal' | 'vertical';
  gap?: number | string;
  align?: CSSProperties['justifyContent'];
}

export function List<T>({
  items,
  renderItem,
  direction = 'vertical',
  gap = 'sm',
  align = 'flex-start',
}: ListProps<T>) {
  if (direction === 'horizontal') {
    return (
      <Group gap={gap} justify={align}>
        {items.map(renderItem)}
      </Group>
    );
  }

  return <Stack gap={gap}>{items.map(renderItem)}</Stack>;
}
