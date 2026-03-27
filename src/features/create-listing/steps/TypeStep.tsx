import { Group, Stack, Title } from '@mantine/core';

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
        <Button onClick={() => select('service')}>Услуга</Button>
        <Button onClick={() => select('space')}>Помещение</Button>
      </Group>
    </Stack>
  );
};

export default TypeStep;
