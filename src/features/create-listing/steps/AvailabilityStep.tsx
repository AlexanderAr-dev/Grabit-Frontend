import dayjs from 'dayjs';
import { useState } from 'react';
import { Box, Checkbox, Flex, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';

const calendarStyles = {
  month: { width: '100%', tableLayout: 'fixed' as const },
  monthCell: { padding: '3px' },
  day: {
    width: '100%',
    height: 40,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeader: {
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calendarHeaderControl: { width: 36, height: 36, minWidth: 36, flex: 'none' },
  calendarHeaderLevel: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    cursor: 'default',
    pointerEvents: 'none' as const,
    flex: 'none',
    padding: '0 4px',
  },
  weekday: {
    textAlign: 'center' as const,
    fontSize: 11,
    paddingBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
  },
};

const AvailabilityStep = ({ data, updateData, next, prev }: StepProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const borderColor = isDark ? '#2a2a2a' : '#e9ecef';
  const cardBg = isDark ? '#1a1a1a' : '#fff';

  const today = dayjs().startOf('day');

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

  const isInRange = (date: Date | string) => {
    if (!startDate || !endDate) return false;
    return dayjs(date).isAfter(startDate, 'day') && dayjs(date).isBefore(endDate, 'day');
  };

  const getDayProps = (type: 'start' | 'end') => (date: Date) => {
    const d = dayjs(date);
    const isPast = d.isBefore(today, 'day');
    const isToday = d.isSame(today, 'day');
    const selected = type === 'start'
      ? !!startDate && d.isSame(startDate, 'day')
      : !!endDate && d.isSame(endDate, 'day');
    const inRange = isInRange(date);
    const isBeforeStart = type === 'end' && !!startDate && d.isBefore(startDate, 'day');

    if (isPast || isBeforeStart) {
      return {
        disabled: true,
        style: {
          backgroundColor: isDark ? '#222' : '#f0f0f0',
          color: isDark ? '#444' : '#bbb',
          borderRadius: 8,
          border: '2px solid transparent',
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      };
    }

    return {
      selected,
      inRange,
      onClick: () => {
        const val = d.format('YYYY-MM-DD');
        if (type === 'start') setStartDate(val);
        else setEndDate(val);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected
          ? '#FF8104'
          : inRange
            ? 'rgba(255,129,4,0.15)'
            : isToday
              ? isDark ? 'rgba(255,129,4,0.18)' : 'rgba(255,129,4,0.08)'
              : undefined,
        color: selected ? '#fff' : isToday ? '#FF8104' : undefined,
        fontWeight: (isToday || selected) ? 700 : undefined,
        border: isToday && !selected ? '2px solid #FF8104' : '2px solid transparent',
        borderRadius: 8,
      },
    };
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Период доступности</Title>

      <Flex gap={24} wrap="wrap">
        <Stack gap={8}>
          <Text size="sm" fw={500} c="dimmed">
            Начало
            {startDate && (
              <Text span fw={600} ml={6} c={isDark ? 'white' : 'dark'}>
                {dayjs(startDate).format('D MMM YYYY')}
              </Text>
            )}
          </Text>
          <Box
            style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 16,
              padding: '16px 16px 12px',
              backgroundColor: cardBg,
            }}
          >
            <Calendar
              maxLevel="month"
              previousIcon={<IconChevronLeft size={22} stroke={2.5} />}
              nextIcon={<IconChevronRight size={22} stroke={2.5} />}
              styles={calendarStyles}
              getDayProps={getDayProps('start')}
            />
          </Box>
        </Stack>

        <Stack gap={8}>
          <Text size="sm" fw={500} c="dimmed">
            Конец
            {endDate && (
              <Text span fw={600} ml={6} c={isDark ? 'white' : 'dark'}>
                {dayjs(endDate).format('D MMM YYYY')}
              </Text>
            )}
          </Text>
          <Box
            style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 16,
              padding: '16px 16px 12px',
              backgroundColor: cardBg,
            }}
          >
            <Calendar
              maxLevel="month"
              previousIcon={<IconChevronLeft size={22} stroke={2.5} />}
              nextIcon={<IconChevronRight size={22} stroke={2.5} />}
              styles={calendarStyles}
              getDayProps={getDayProps('end')}
            />
          </Box>
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
