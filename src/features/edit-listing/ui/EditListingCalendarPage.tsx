import React, { useEffect, useState } from 'react';
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
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { Button } from '@shared/ui';
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

const DAY_NUM: Record<WeekDay, string> = {
  mon: '1', tue: '2', wed: '3', thu: '4', fri: '5', sat: '6', sun: '7',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const emptySchedule = () =>
  Object.fromEntries(DAYS.map(d => [d.key, Array(24).fill(false)])) as Record<WeekDay, boolean[]>;

const availKey = (id: string) => `grabit_avail_${id}`;

interface SavedAvailability {
  startDate: string | null;
  endDate: string | null;
  enabledDays: WeekDay[];
  schedule: Record<WeekDay, boolean[]>;
}

function loadSavedAvailability(id: string): Partial<SavedAvailability> {
  try {
    const raw = localStorage.getItem(availKey(id));
    return raw ? (JSON.parse(raw) as SavedAvailability) : {};
  } catch {
    return {};
  }
}

function persistAvailability(id: string, data: SavedAvailability) {
  try {
    localStorage.setItem(availKey(id), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const EditListingCalendarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const accent = '#FF8104';

  const saved = id ? loadSavedAvailability(id) : {};

  const [startDate, setStartDate] = useState<string | null>(saved.startDate ?? null);
  const [endDate, setEndDate] = useState<string | null>(saved.endDate ?? null);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [enabledDays, setEnabledDays] = useState<WeekDay[]>(saved.enabledDays ?? []);
  const [schedule, setSchedule] = useState<Record<WeekDay, boolean[]>>(
    saved.schedule ?? emptySchedule(),
  );
  const [activeDay, setActiveDay] = useState<WeekDay>(
    saved.enabledDays?.[0] ?? 'mon',
  );

  const { mutate: saveCalendar, isPending: isSaving } = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('Missing id'));
      // No dates selected — skip availability API call, just navigate
      if (!startDate || !endDate) return Promise.resolve();
      const weekday_hours: Record<string, number[]> = {};
      enabledDays.forEach(day => {
        weekday_hours[DAY_NUM[day]] = schedule[day]
          .map((active, i) => (active ? i : -1))
          .filter(i => i >= 0);
      });
      return rentService.setAvailability(id, [
        { valid_from: startDate, valid_until: endDate, weekday_hours },
      ]);
    },
    onSuccess: () => {
      if (id) {
        persistAvailability(id, { startDate, endDate, enabledDays, schedule });
      }
      queryClient.invalidateQueries({ queryKey: ['rentAd', id] });
      navigate('/my-products');
    },
  });

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

  const borderColor = isDark ? '#2a2a2a' : '#e9ecef';
  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const today = dayjs().startOf('day');

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

  const getDayPropsForRange = (type: 'start' | 'end') => (date: Date) => {
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
        } as React.CSSProperties,
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
      } as React.CSSProperties,
    };
  };

  return (
    <EditListingLayout>
      <Stack gap="xl">
        <Stack gap="md">
          <Title order={3}>Период доступности</Title>

          <Flex gap={24} wrap="wrap">
            <Stack gap={8}>
              <Text size="sm" fw={500} c="dimmed">
                Начало
                {startDate && (
                  <Text span fw={600} ml={6}>
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
                  getDayProps={getDayPropsForRange('start')}
                />
              </Box>
            </Stack>

            <Stack gap={8}>
              <Text size="sm" fw={500} c="dimmed">
                Конец
                {endDate && (
                  <Text span fw={600} ml={6}>
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
                  getDayProps={getDayPropsForRange('end')}
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
        </Stack>

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
          <Button onClick={() => saveCalendar()} isLoading={isSaving}>
            Сохранить
          </Button>
        </Flex>
      </Stack>
    </EditListingLayout>
  );
};
