import { useState } from 'react';
import { Box, Flex, Group, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { BookingSettings, WeekDay } from '@shared/types';

const DAY_KEYS: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Props {
  booking?: BookingSettings;
}

export const BookingCalendar = ({ booking }: Props) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const enabledDays = new Set<WeekDay>(booking?.enabledDays ?? []);
  const start = booking?.availabilityRange?.start ? dayjs(booking.availabilityRange.start) : null;
  const end = booking?.availabilityRange?.end ? dayjs(booking.availabilityRange.end) : null;

  const isAvailable = (date: dayjs.Dayjs): boolean => {
    if (!start || !end) return false;
    if (date.isBefore(start, 'day') || date.isAfter(end, 'day')) return false;
    const weekday = DAY_KEYS[date.day()]; // date.day(): 0=вс, 1=пн...
    return enabledDays.has(weekday);
  };

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.day(); // 0=вс, 1=пн...
  // Смещение: приводим к началу с пн
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const selectedSchedule = (() => {
    if (!selectedDay || !booking?.schedule) return null;
    const d = dayjs(selectedDay);
    const weekday = DAY_KEYS[d.day()] as WeekDay;
    return booking.schedule.find(s => s.day === weekday) ?? null;
  })();

  const bgAvailable = isDark ? '#1a4a1a' : '#e6f7e6';
  const bgUnavailable = isDark ? '#2a2a2a' : '#f1f3f5';
  const bgSelected = '#FF8104';
  const textAvailable = isDark ? '#6fcf6f' : '#2d862d';
  const textToday = '#FF8104';

  const today = dayjs().startOf('day');

  return (
    <Stack gap="md">
      <Text size="xl" fw={600} mb={8}>Календарь доступности</Text>

      {/* Навигация по месяцам */}
      <Group justify="space-between" align="center">
        <Box
          style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
          onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}
        >
          <IconChevronLeft size={20} />
        </Box>
        <Text fw={600} size="md" style={{ textTransform: 'capitalize' }}>
          {currentMonth.format('MMMM YYYY')}
        </Text>
        <Box
          style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
          onClick={() => setCurrentMonth(m => m.add(1, 'month'))}
        >
          <IconChevronRight size={20} />
        </Box>
      </Group>

      {/* Дни недели */}
      <Flex gap={4}>
        {DAY_LABELS.map(label => (
          <Box
            key={label}
            style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}
          >
            <Text size="xs" fw={600} c="dimmed">{label}</Text>
          </Box>
        ))}
      </Flex>

      {/* Сетка дней */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {/* Пустые ячейки перед первым днём */}
        {Array.from({ length: offset }).map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {/* Дни месяца */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = currentMonth.date(i + 1);
          const dateStr = date.format('YYYY-MM-DD');
          const available = isAvailable(date);
          const isToday = date.isSame(today, 'day');
          const isSelected = selectedDay === dateStr;

          return (
            <Box
              key={dateStr}
              onClick={() => available && setSelectedDay(isSelected ? null : dateStr)}
              style={{
                borderRadius: 8,
                padding: '6px 2px',
                textAlign: 'center',
                cursor: available ? 'pointer' : 'default',
                backgroundColor: isSelected
                  ? bgSelected
                  : available
                    ? bgAvailable
                    : bgUnavailable,
                transition: 'background-color 0.15s',
                border: isToday ? `2px solid ${textToday}` : '2px solid transparent',
              }}
            >
              <Text
                size="sm"
                fw={isToday ? 700 : 400}
                c={
                  isSelected
                    ? '#fff'
                    : isToday
                      ? textToday
                      : available
                        ? textAvailable
                        : 'dimmed'
                }
              >
                {i + 1}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Легенда */}
      <Group gap="xl" mt={4}>
        <Group gap={6}>
          <Box style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bgAvailable, border: `1px solid ${textAvailable}` }} />
          <Text size="xs" c="dimmed">Доступно</Text>
        </Group>
        <Group gap={6}>
          <Box style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bgUnavailable }} />
          <Text size="xs" c="dimmed">Недоступно</Text>
        </Group>
        <Group gap={6}>
          <Box style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bgSelected }} />
          <Text size="xs" c="dimmed">Выбрано</Text>
        </Group>
      </Group>

      {/* Расписание выбранного дня */}
      {selectedDay && (
        <Box
          p="md"
          style={{
            borderRadius: 12,
            border: `1px solid ${isDark ? '#333' : '#e9ecef'}`,
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
          }}
        >
          <Text fw={600} mb="sm">
            {dayjs(selectedDay).format('D MMMM YYYY')} — доступные часы
          </Text>
          {selectedSchedule ? (
            <>
              <Flex gap={4} wrap="wrap" mb="xs">
                {selectedSchedule.hours.map((available, hour) => (
                  available ? (
                    <Box
                      key={hour}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: isDark ? '#1a4a1a' : '#e6f7e6',
                        border: `1px solid ${isDark ? '#2d862d' : '#a3d9a3'}`,
                      }}
                    >
                      <Text size="xs" c={isDark ? '#6fcf6f' : '#2d862d'}>
                        {hour.toString().padStart(2, '0')}:00
                      </Text>
                    </Box>
                  ) : null
                ))}
              </Flex>
              {selectedSchedule.minDuration > 1 && (
                <Text size="xs" c="dimmed">
                  Минимальная аренда: {selectedSchedule.minDuration} ч
                </Text>
              )}
            </>
          ) : (
            <Text size="sm" c="dimmed">Расписание на этот день не задано</Text>
          )}
        </Box>
      )}

      {/* Инфо о периоде */}
      {start && end && (
        <Text size="xs" c="dimmed">
          Период аренды: {start.format('D MMM YYYY')} — {end.format('D MMM YYYY')}
          {booking?.autoRenewal && ' · автообновление'}
        </Text>
      )}
    </Stack>
  );
};
