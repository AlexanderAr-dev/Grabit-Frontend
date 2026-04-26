import { useState } from 'react';
import { Flex, Stack, Title } from '@mantine/core';

import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';

const BookingRangeStep = ({ data, updateData, next, prev }: StepProps) => {
  const [startDate, setStartDate] = useState<string | null>(
    data.booking?.availabilityRange?.start ?? null,
  );
  const [endDate, setEndDate] = useState<string | null>(
    data.booking?.availabilityRange?.end ?? null,
  );

  const handleNext = () => {
    if (!startDate || !endDate) return;
    updateData({
      booking: {
        ...data.booking,
        availabilityRange: { start: startDate, end: endDate },
      },
    });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Период доступности</Title>

      <Flex gap="md">
        <input
          type="date"
          value={startDate ?? ''}
          onChange={e => setStartDate(e.currentTarget.value || null)}
        />
        <input
          type="date"
          value={endDate ?? ''}
          onChange={e => setEndDate(e.currentTarget.value || null)}
        />
      </Flex>

      <Flex gap="md" justify="space-between">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!startDate || !endDate} onClick={handleNext}>Далее</Button>
      </Flex>
    </Stack>
  );
};

export default BookingRangeStep;
