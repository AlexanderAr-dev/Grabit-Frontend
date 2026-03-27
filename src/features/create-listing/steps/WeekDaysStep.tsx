import { useState } from 'react';
import { Button, Checkbox, Group, Stack, Title } from '@mantine/core';

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
    updateData({ booking: { ...data.booking, enabledDays: selected } });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Дни аренды</Title>
      <Stack>
        {days.map(d => (
          <Checkbox
            key={d.key}
            label={d.label}
            checked={selected.includes(d.key)}
            onChange={() => toggleDay(d.key)}
          />
        ))}
      </Stack>
      <Group justify="space-between">
        <Button variant="default" onClick={prev}>Назад</Button>
        <Button disabled={!selected.length} onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default WeekDaysStep;
