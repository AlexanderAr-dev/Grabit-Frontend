import dayjs from 'dayjs';
import { useState } from 'react';
import { Flex, Stack, Text, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useMantineColorScheme } from '@mantine/core';

import { componentsTheme } from '@shared/config/componentsTheme';
import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';

const RentalPeriodStep = ({ data, updateData, next, prev }: StepProps) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = componentsTheme.buttonTheme[colorScheme];

  const [startDate, setStartDate] = useState<string | null>(
    data.booking?.rentalPeriod?.start ?? null,
  );
  const [endDate, setEndDate] = useState<string | null>(
    data.booking?.rentalPeriod?.end ?? null,
  );

  const handleNext = () => {
    if (!startDate || !endDate) return;
    updateData({
      booking: {
        ...data.booking,
        rentalPeriod: { start: startDate, end: endDate },
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
    backgroundColor: isSelected
      ? theme.primary.backgroundColor
      : inRange
        ? `${theme.primary.backgroundColor}33`
        : undefined,
    color: isSelected ? '#fff' : undefined,
  });

  return (
    <Stack gap="lg">
      <Title order={2}>Период аренды</Title>

      <Flex gap="xl" wrap="wrap">
        <Stack gap={4}>
          <Text size="sm" fw={500} c="dimmed">
            Начало
            {startDate ? (
              <Text span c="dark" fw={600} ml={6}>
                {dayjs(startDate).format('D MMM YYYY')}
              </Text>
            ) : null}
          </Text>
          <Calendar
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

        <Stack gap={4}>
          <Text size="sm" fw={500} c="dimmed">
            Конец
            {endDate ? (
              <Text span c="dark" fw={600} ml={6}>
                {dayjs(endDate).format('D MMM YYYY')}
              </Text>
            ) : null}
          </Text>
          <Calendar
            getDayProps={date => {
              const isSelected = !!endDate && dayjs(date).isSame(endDate, 'day');
              const inRange = isInRange(date);
              const isBeforeStart =
                !!startDate && dayjs(date).isBefore(startDate, 'day');
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

      <Flex gap="md" justify="space-between">
        <Button variant="secondary" onClick={prev}>
          Назад
        </Button>
        <Button disabled={!startDate || !endDate} onClick={handleNext}>
          Далее
        </Button>
      </Flex>
    </Stack>
  );
};

export default RentalPeriodStep;
