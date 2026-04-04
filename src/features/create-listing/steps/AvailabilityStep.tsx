import dayjs from 'dayjs';
import { useState } from 'react';
import { Checkbox, Flex, Stack, Text, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useMantineColorScheme } from '@mantine/core';

import { componentsTheme } from '@shared/config/componentsTheme';
import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';

const AvailabilityStep = ({ data, updateData, next, prev }: StepProps) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = componentsTheme.buttonTheme[colorScheme];
  const accent = theme.primary.backgroundColor;

  const [startDate, setStartDate] = useState<string | null>(
    data.booking?.availabilityRange?.start ?? null,
  );
  const [endDate, setEndDate] = useState<string | null>(
    data.booking?.availabilityRange?.end ?? null,
  );
  const [autoRenewal, setAutoRenewal] = useState(data.booking?.autoRenewal ?? false);

  const handleNext = () => {
    if (!startDate || !endDate) return;
    updateData({
      booking: {
        ...data.booking,
        availabilityRange: { start: startDate, end: endDate },
        autoRenewal,
      },
    });
    next?.();
  };

  const isInRange = (date: string) => {
    if (!startDate || !endDate) return false;
    return dayjs(date).isAfter(startDate, 'day') && dayjs(date).isBefore(endDate, 'day');
  };

  const calendarDayStyle = (isSelected: boolean, inRange: boolean) => ({
    borderRadius: isSelected ? 8 : inRange ? 0 : 4,
    backgroundColor: isSelected ? accent : inRange ? `${accent}33` : undefined,
    color: isSelected ? '#fff' : undefined,
  });

  const calendarStyles = {
    calendarHeaderControl: { width: 22, height: 22, minWidth: 22 },
    calendarHeaderControlIcon: { width: 12, height: 12 },
    day: { width: 38, height: 38, fontSize: 14 },
    monthCell: { padding: '2px' },
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Период доступности</Title>

      <Flex gap={40} wrap="wrap">
        <Stack gap={6}>
          <Text size="sm" fw={500} c="dimmed">
            Начало
            {startDate && (
              <Text span fw={600} ml={6} c="dark">
                {dayjs(startDate).format('D MMM YYYY')}
              </Text>
            )}
          </Text>
          <Calendar
            size="md"
            styles={calendarStyles}
            getDayProps={date => {
              const isSelected = !!startDate && dayjs(date).isSame(startDate, 'day');
              const inRange = isInRange(date);
              return {
                selected: isSelected,
                inRange,
                onClick: () => setStartDate(date),
                style: calendarDayStyle(isSelected, inRange),
              };
            }}
          />
        </Stack>

        <Stack gap={6}>
          <Text size="sm" fw={500} c="dimmed">
            Конец
            {endDate && (
              <Text span fw={600} ml={6} c="dark">
                {dayjs(endDate).format('D MMM YYYY')}
              </Text>
            )}
          </Text>
          <Calendar
            size="md"
            styles={calendarStyles}
            getDayProps={date => {
              const isSelected = !!endDate && dayjs(date).isSame(endDate, 'day');
              const inRange = isInRange(date);
              const isBeforeStart = !!startDate && dayjs(date).isBefore(startDate, 'day');
              return {
                selected: isSelected,
                inRange,
                disabled: isBeforeStart,
                onClick: () => setEndDate(date),
                style: calendarDayStyle(isSelected, inRange),
              };
            }}
          />
        </Stack>
      </Flex>

      <Checkbox
        label="Автообновление"
        checked={autoRenewal}
        onChange={e => setAutoRenewal(e.currentTarget.checked)}
        color="#FF8104"
      />

      <Flex gap="md" justify="space-between">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!startDate || !endDate} onClick={handleNext}>Далее</Button>
      </Flex>
    </Stack>
  );
};

export default AvailabilityStep;
