import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Checkbox,
  Flex,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  Box,
  Tabs,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import dayjs from 'dayjs';
import { mockRentAd } from '@entities/rental';
import { Button } from '@shared/ui';
import { componentsTheme } from '@shared/config';
import { WeekDay } from '@shared/types';
import { EditListingLayout } from './EditListingLayout';

const DAYS: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'Понедельник' },
  { key: 'tue', label: 'Вторник' },
  { key: 'wed', label: 'Среда' },
  { key: 'thu', label: 'Четверг' },
  { key: 'fri', label: 'Пятница' },
  { key: 'sat', label: 'Суббота' },
  { key: 'sun', label: 'Воскресенье' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const EditListingCalendarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const theme = componentsTheme.buttonTheme[colorScheme];
  const accent = theme.primary.backgroundColor;
  const isDark = colorScheme === 'dark';

  const numId = Number(id);
  const listing = mockRentAd.find(a => a.id === numId) ?? mockRentAd[0];
  const initBooking = listing.booking;

  const [startDate, setStartDate] = useState<string | null>(
    initBooking?.availabilityRange?.start ?? null,
  );
  const [endDate, setEndDate] = useState<string | null>(
    initBooking?.availabilityRange?.end ?? null,
  );
  const [autoRenewal, setAutoRenewal] = useState(initBooking?.autoRenewal ?? false);
  const [enabledDays, setEnabledDays] = useState<WeekDay[]>(initBooking?.enabledDays ?? []);

  // schedule: hours[24] per day
  const initSchedule = Object.fromEntries(
    DAYS.map(d => {
      const existing = initBooking?.schedule?.find(s => s.day === d.key);
      return [d.key, existing?.hours ?? Array(24).fill(false)];
    }),
  ) as Record<WeekDay, boolean[]>;

  const [schedule, setSchedule] = useState<Record<WeekDay, boolean[]>>(initSchedule);
  const [activeDay, setActiveDay] = useState<WeekDay>(enabledDays[0] ?? 'mon');

  const toggleDay = (day: WeekDay) => {
    setEnabledDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const toggleHour = (day: WeekDay, hour: number) => {
    setSchedule(prev => {
      const hours = [...prev[day]];
      hours[hour] = !hours[hour];
      return { ...prev, [day]: hours };
    });
  };

  const isInRange = (date: Date | string) => {
    if (!startDate || !endDate) return false;
    return dayjs(date).isAfter(startDate, 'day') && dayjs(date).isBefore(endDate, 'day');
  };

  const calendarDayStyle = (isSelected: boolean, inRange: boolean): React.CSSProperties => ({
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

  const handleSave = () => {
    navigate('/my-products');
  };

  return (
    <EditListingLayout>
      <Stack gap="xl">
        {/* Период доступности */}
        <Stack gap="md">
          <Title order={3}>Период доступности</Title>

          <Flex gap={40} wrap="wrap">
            <Stack gap={6}>
              <Text size="sm" fw={500} c="dimmed">
                Начало
                {startDate && (
                  <Text span fw={600} ml={6}>
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
                    onClick: () => setStartDate(dayjs(date).format('YYYY-MM-DD')),
                    style: calendarDayStyle(isSelected, inRange),
                  };
                }}
              />
            </Stack>

            <Stack gap={6}>
              <Text size="sm" fw={500} c="dimmed">
                Конец
                {endDate && (
                  <Text span fw={600} ml={6}>
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
                    onClick: () => setEndDate(dayjs(date).format('YYYY-MM-DD')),
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
        </Stack>

        {/* Дни аренды */}
        <Stack gap="sm">
          <Title order={3}>Дни аренды</Title>
          {DAYS.map(d => (
            <Checkbox
              key={d.key}
              label={d.label}
              checked={enabledDays.includes(d.key)}
              onChange={() => toggleDay(d.key)}
              size="md"
              color="#FF8104"
              styles={{ label: { cursor: 'pointer' }, input: { cursor: 'pointer' } }}
            />
          ))}
        </Stack>

        {/* Расписание по дням */}
        {enabledDays.length > 0 && (
          <Stack gap="sm">
            <Title order={3}>Расписание</Title>
            <Tabs
              value={activeDay}
              onChange={v => setActiveDay(v as WeekDay)}
              keepMounted={false}
            >
              <Tabs.List>
                {enabledDays.map(day => {
                  const label = DAYS.find(d => d.key === day)?.label?.slice(0, 2) ?? day;
                  return (
                    <Tabs.Tab key={day} value={day}>
                      {label}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>

              {enabledDays.map(day => (
                <Tabs.Panel key={day} value={day} pt="md">
                  <Text size="sm" c="dimmed" mb="sm">
                    Нажмите на часы, чтобы отметить как доступные
                  </Text>
                  <Flex gap={4} wrap="wrap">
                    {HOURS.map(hour => {
                      const active = schedule[day][hour];
                      return (
                        <Box
                          key={hour}
                          onClick={() => toggleHour(day, hour)}
                          style={{
                            width: 50,
                            padding: '6px 4px',
                            borderRadius: 6,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: `1px solid ${active ? accent : isDark ? '#444' : '#ddd'}`,
                            backgroundColor: active ? `${accent}22` : isDark ? '#2a2a2a' : '#f8f9fa',
                            color: active ? accent : isDark ? '#aaa' : '#555',
                            fontSize: 12,
                            fontWeight: active ? 600 : 400,
                            userSelect: 'none',
                          }}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </Box>
                      );
                    })}
                  </Flex>
                </Tabs.Panel>
              ))}
            </Tabs>
          </Stack>
        )}

        <Flex gap="md" justify="space-between" mt="md">
          <Button variant="secondary" onClick={() => navigate(`/edit-listing/${id}`)}>
            ← Назад
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </Flex>
      </Stack>
    </EditListingLayout>
  );
};
