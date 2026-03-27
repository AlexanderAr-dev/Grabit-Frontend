import { useState } from 'react';
import { Checkbox, Flex, Stack, Title } from '@mantine/core';

import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';
import { WeekDay } from '../model/types/CreateListing';

const days: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'Понедельник' },
  { key: 'tue', label: 'Вторник' },
  { key: 'wed', label: 'Среда' },
  { key: 'thu', label: 'Четверг' },
  { key: 'fri', label: 'Пятница' },
  { key: 'sat', label: 'Суббота' },
  { key: 'sun', label: 'Воскресенье' },
];

const WeekDaysStep = ({ data, updateData, next, prev }: StepProps) => {
  const [selected, setSelected] = useState<WeekDay[]>(
    data.booking?.enabledDays ?? [],
  );

  const toggleDay = (day: WeekDay) => {
    setSelected(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleNext = () => {
    if (!selected.length) return;
    updateData({ booking: { ...data.booking, enabledDays: selected } });
    next?.();
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Дни аренды</Title>
      <Stack gap="md">
        {days.map(d => (
          <Checkbox
            key={d.key}
            label={d.label}
            checked={selected.includes(d.key)}
            onChange={() => toggleDay(d.key)}
            size="lg"
            styles={{
              label: { fontSize: 18, cursor: 'pointer' },
              input: { cursor: 'pointer' },
            }}
          />
        ))}
      </Stack>
      <Flex gap="md" justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!selected.length} onClick={handleNext}>Далее</Button>
      </Flex>
    </Stack>
  );
};

export default WeekDaysStep;
