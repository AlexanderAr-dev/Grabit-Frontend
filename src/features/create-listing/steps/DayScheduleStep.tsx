import { useEffect, useState } from 'react';
import { Flex, NumberInput, SimpleGrid, Stack, Tabs, Text, Title, UnstyledButton } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

import { componentsTheme } from '@shared/config/componentsTheme';
import { Button } from '@shared/ui';
import { DaySchedule, WeekDay } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

const dayLabels: Record<WeekDay, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
};

const dayLabelsFull: Record<WeekDay, string> = {
  mon: 'Понедельник',
  tue: 'Вторник',
  wed: 'Среда',
  thu: 'Четверг',
  fri: 'Пятница',
  sat: 'Суббота',
  sun: 'Воскресенье',
};

const DayScheduleStep = ({ data, updateData, next, prev }: StepProps) => {
  const { colorScheme } = useMantineColorScheme();
  const accent = componentsTheme.buttonTheme[colorScheme].primary.backgroundColor;

  const enabledDays = data.booking?.enabledDays ?? [];
  const enabledDaysKey = enabledDays.join(',');

  const [schedules, setSchedules] = useState<DaySchedule[]>(() =>
    enabledDays.map(day => ({
      day,
      hours: Array(24).fill(true) as boolean[],
      minDuration: 1,
    })),
  );

  const [activeDay, setActiveDay] = useState<string>(enabledDays[0] ?? '');

  // Sync when the user goes back and changes selected days
  useEffect(() => {
    setSchedules(prev => {
      const existing = new Map(prev.map(s => [s.day, s]));
      return enabledDays.map(
        day =>
          existing.get(day) ?? {
            day,
            hours: Array(24).fill(true) as boolean[],
            minDuration: 1,
          },
      );
    });
    if (enabledDays.length > 0 && !enabledDays.includes(activeDay as WeekDay)) {
      setActiveDay(enabledDays[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledDaysKey]);

  const activeDayIndex = schedules.findIndex(s => s.day === activeDay);
  const activeSchedule = schedules[activeDayIndex];

  const toggleHour = (hour: number) => {
    setSchedules(prev =>
      prev.map((s, i) =>
        i === activeDayIndex
          ? { ...s, hours: s.hours.map((h, hi) => (hi === hour ? !h : h)) }
          : s,
      ),
    );
  };

  const setMinDuration = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseInt(val, 10);
    if (isNaN(num) || num < 1) return;
    setSchedules(prev =>
      prev.map((s, i) => (i === activeDayIndex ? { ...s, minDuration: num } : s)),
    );
  };

  const handleFinish = () => {
    updateData({ booking: { ...data.booking, schedule: schedules } });
    next?.();
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Расписание по дням</Title>

      <Tabs
        value={activeDay}
        onChange={val => val && setActiveDay(val)}
        color="#FF8104"
        styles={{
          tab: { fontWeight: 600, fontSize: 15, padding: '8px 16px' },
          tabLabel: { fontSize: 15 },
        }}
      >
        <Tabs.List>
          {schedules.map(s => (
            <Tabs.Tab key={s.day} value={s.day}>
              {dayLabels[s.day]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {activeSchedule && (
        <Stack gap="md">
          <Text fw={600} size="lg">
            {dayLabelsFull[activeSchedule.day]}
          </Text>

          <SimpleGrid cols={6} spacing={6}>
            {activeSchedule.hours.map((enabled, hour) => (
              <UnstyledButton
                key={hour}
                onClick={() => toggleHour(hour)}
                style={{
                  padding: '6px 0',
                  textAlign: 'center',
                  borderRadius: 6,
                  border: `1px solid ${enabled ? accent : '#dee2e6'}`,
                  background: enabled ? accent : '#f1f3f5',
                  color: enabled ? '#fff' : '#868e96',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {hour}:00
              </UnstyledButton>
            ))}
          </SimpleGrid>

          <NumberInput
            label="Минимальное окно (часов)"
            min={1}
            max={24}
            value={activeSchedule.minDuration}
            onChange={setMinDuration}
            w={220}
          />
        </Stack>
      )}

      <Flex gap="md" justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button onClick={handleFinish}>Готово</Button>
      </Flex>
    </Stack>
  );
};

export default DayScheduleStep;
