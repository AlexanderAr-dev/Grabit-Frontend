import { Group, Stack, Text, Title } from '@mantine/core';

import { Button } from '@shared/ui';
import { ListingType } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

const TypeStep = ({ updateData, next }: StepProps) => {
  const select = (type: ListingType) => {
    updateData({ type });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Тип объявления</Title>
      <Group>
        <Button onClick={() => select('item_rent')}>Предмет</Button>
        <div title="Скоро" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Button
            disabled
            style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}
          >
            Услуга
          </Button>
          <Text size="xs" c="dimmed">Скоро</Text>
        </div>
        <div title="Скоро" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Button
            disabled
            style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}
          >
            Помещение
          </Button>
          <Text size="xs" c="dimmed">Скоро</Text>
        </div>
      </Group>
    </Stack>
  );
};

export default TypeStep;
