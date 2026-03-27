import { useState } from 'react';
import { Button, Group, Stack, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

import { StepProps } from '../model/types/StepProps';

const BookingRangeStep = ({ data, updateData, next, prev }: StepProps) => {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleNext = () => {
    if (!range[0] || !range[1]) return;
    updateData({
      booking: {
        ...data.booking,
        range: { start: range[0], end: range[1] },
      },
    });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Период доступности</Title>

      <DatePickerInput
        type="range"
        label="Когда доступна аренда"
        value={range}
        onChange={setRange}
      />

      <Group justify="space-between">
        <Button variant="default" onClick={prev}>Назад</Button>
        <Button onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default BookingRangeStep;
