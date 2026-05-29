import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  NumberInput,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IconAlertCircle, IconCheck, IconChevronLeft, IconChevronRight, IconLogin } from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import { bookingService, rentService } from '@shared/api';
import { useAuth } from '@features/auth';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'ожидает подтверждения',
  approved: 'подтверждено',
  active: 'активно',
  completed: 'завершено',
  rejected: 'отклонено',
  cancelled: 'отменено',
};

interface BookingWidgetProps {
  listingId: string;
  pricePerHour: number;
  maxQuantity: number;
}

export const BookingWidget = ({ listingId, pricePerHour, maxQuantity }: BookingWidgetProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, login } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const today = dayjs().startOf('day');

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', listingId, selectedDate],
    queryFn: () => rentService.getAvailableSlots({ listingId, date: selectedDate! }),
    enabled: !!selectedDate,
  });

  const availableHours = useMemo(() => new Set(slotsData?.available_hours ?? []), [slotsData]);

  const mutation = useMutation({
    mutationFn: bookingService.createBooking,
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStartHour(null);
    setEndHour(null);
    mutation.reset();
  };

  const handleStartHour = (hour: number) => {
    setStartHour(hour);
    setEndHour(null);
    mutation.reset();
  };

  const handleSubmit = () => {
    if (!selectedDate || startHour === null || endHour === null || endHour <= startHour) return;
    const base = dayjs(selectedDate).startOf('day');
    mutation.mutate({
      listing_id: listingId,
      quantity,
      start_time: base.hour(startHour).toISOString(),
      end_time: base.hour(endHour).toISOString(),
    });
  };

  const duration = startHour !== null && endHour !== null ? endHour - startHour : 0;
  const totalPrice = duration * pricePerHour * quantity;

  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const borderColor = isDark ? '#2a2a2a' : '#e9ecef';
  const bgSlot = isDark ? '#1a3a1a' : '#e8f5e9';
  const bgSlotUnavailable = isDark ? '#3a1a1a' : '#fff0f0';
  const textSlot = isDark ? '#81c784' : '#2e7d32';
  const textUnavail = isDark ? '#e57373' : '#c62828';

  return (
    <Stack gap="md">
      <Text size="xl" fw={600}>Забронировать</Text>

      {/* Инлайн-календарь */}
      <Box
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: '20px 20px 16px',
          backgroundColor: cardBg,
          overflow: 'hidden',
        }}
      >
        <Calendar
          locale="ru"
          maxLevel="month"
          previousIcon={<IconChevronLeft size={27} stroke={2.5} />}
          nextIcon={<IconChevronRight size={27} stroke={2.5} />}
          getDayProps={date => {
            const d = dayjs(date);
            const isPast = d.isBefore(today, 'day');
            const isSelected = !!selectedDate && d.isSame(selectedDate, 'day');
            const isToday = d.isSame(today, 'day');

            if (isPast) {
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
              onClick: () => handleDateSelect(date),
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected
                  ? '#FF8104'
                  : isToday
                    ? isDark ? 'rgba(255,129,4,0.18)' : 'rgba(255,129,4,0.12)'
                    : undefined,
                color: isSelected ? '#fff' : isToday ? '#FF8104' : undefined,
                fontWeight: isToday || isSelected ? 700 : undefined,
                border: isToday && !isSelected ? '2px solid #FF8104' : '2px solid transparent',
                borderRadius: 8,
              },
            };
          }}
          styles={{
            month: { width: '100%', tableLayout: 'fixed' as const },
            monthCell: { padding: '3px' },
            day: {
              width: '100%',
              height: 46,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            calendarHeader: {
              marginBottom: 14,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            },
            calendarHeaderControl: { width: 44, height: 44, minWidth: 44, flex: 'none' },
            calendarHeaderLevel: {
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              cursor: 'default',
              pointerEvents: 'none',
              flex: 'none',
              padding: '0 4px',
            },
            weekday: {
              textAlign: 'center',
              fontSize: 11,
              paddingBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: isDark ? '#888' : '#aaa',
            },
          }}
        />
      </Box>

      {/* Слоты выбранного дня */}
      {selectedDate && slotsLoading && (
        <Flex align="center" gap="sm">
          <Loader size="xs" />
          <Text size="sm" c="dimmed">Загрузка доступных часов...</Text>
        </Flex>
      )}

      {selectedDate && !slotsLoading && slotsData && (
        <Box
          style={{
            border: `1px solid ${borderColor}`,
            borderRadius: 14,
            padding: '14px 16px',
            backgroundColor: cardBg,
          }}
        >
          <Text size="sm" fw={600} mb={10}>
            {dayjs(selectedDate).locale('ru').format('D MMMM YYYY')} — выберите время начала
          </Text>

          {availableHours.size === 0 ? (
            <Text size="sm" c="dimmed">Нет доступных часов на этот день</Text>
          ) : (
            <>
              <Flex gap={4} wrap="wrap" mb={10}>
                {Array.from({ length: 24 }, (_, h) => {
                  const avail = availableHours.has(h);
                  const isSelected = startHour === h;
                  return (
                    <Box
                      key={h}
                      onClick={() => avail && handleStartHour(h)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 7,
                        cursor: avail ? 'pointer' : 'default',
                        backgroundColor: isSelected
                          ? '#FF8104'
                          : avail ? bgSlot : bgSlotUnavailable,
                        border: `1px solid ${
                          isSelected
                            ? '#FF8104'
                            : avail
                              ? isDark ? '#388e3c' : '#a5d6a7'
                              : isDark ? '#5a2020' : '#ffcdd2'
                        }`,
                        transition: 'background-color 0.12s',
                        minWidth: 54,
                        textAlign: 'center',
                      }}
                    >
                      <Text size="xs" fw={500} c={isSelected ? '#fff' : avail ? textSlot : textUnavail}>
                        {h.toString().padStart(2, '0')}:00
                      </Text>
                      {!avail && (
                        <Text size="xs" c={textUnavail} style={{ fontSize: 9, lineHeight: 1.2 }}>
                          занято
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Flex>

              {/* Легенда */}
              <Flex gap="lg" mt={6}>
                <Flex gap={4} align="center">
                  <Box style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: bgSlot, border: `1px solid ${isDark ? '#388e3c' : '#a5d6a7'}` }} />
                  <Text size="xs" c="dimmed">Доступно</Text>
                </Flex>
                <Flex gap={4} align="center">
                  <Box style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: bgSlotUnavailable, border: `1px solid ${isDark ? '#5a2020' : '#ffcdd2'}` }} />
                  <Text size="xs" c="dimmed">Занято / вне расписания</Text>
                </Flex>
              </Flex>
            </>
          )}
        </Box>
      )}

      {/* Время окончания */}
      {startHour !== null && (
        <Box
          style={{
            border: `1px solid ${borderColor}`,
            borderRadius: 14,
            padding: '14px 16px',
            backgroundColor: cardBg,
          }}
        >
          <Text size="sm" fw={600} mb={10}>Выберите время окончания</Text>
          <Flex gap={4} wrap="wrap">
            {(() => {
              const endOptions: number[] = [];
              for (let h = startHour + 1; h <= 23; h++) {
                if (!availableHours.has(h - 1)) break;
                endOptions.push(h);
              }
              if (endOptions.length === 0) {
                return <Text size="sm" c="dimmed">Нет доступных часов окончания</Text>;
              }
              return endOptions.map(h => {
                const isSelected = endHour === h;
                return (
                  <Box
                    key={h}
                    onClick={() => { setEndHour(h); mutation.reset(); }}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      minWidth: 54,
                      textAlign: 'center',
                      backgroundColor: isSelected ? '#FF8104' : bgSlot,
                      border: `1px solid ${isSelected ? '#FF8104' : isDark ? '#388e3c' : '#a5d6a7'}`,
                      transition: 'background-color 0.12s',
                    }}
                  >
                    <Text size="xs" fw={500} c={isSelected ? '#fff' : textSlot}>
                      {h.toString().padStart(2, '0')}:00
                    </Text>
                  </Box>
                );
              });
            })()}
          </Flex>
        </Box>
      )}

      {/* Количество */}
      {maxQuantity > 1 && (
        <NumberInput
          label="Количество"
          value={quantity}
          onChange={v => setQuantity(Number(v) || 1)}
          min={1}
          max={maxQuantity}
          radius="md"
          style={{ maxWidth: 160 }}
        />
      )}

      {/* Итог */}
      {duration > 0 && (
        <Box
          p="sm"
          style={{
            borderRadius: 12,
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
            border: `1px solid ${borderColor}`,
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {duration} ч × {pricePerHour} ₽{maxQuantity > 1 ? ` × ${quantity} шт.` : ''}
            </Text>
            <Text fw={700} size="md">{totalPrice} ₽</Text>
          </Group>
        </Box>
      )}

      {/* Статус бронирования */}
      {mutation.isSuccess && (
        <Alert icon={<IconCheck size={16} />} color="green" radius="md">
          <Text fw={600}>Бронирование создано!</Text>
          <Text size="sm" c="dimmed">
            Статус: {BOOKING_STATUS_LABELS[mutation.data.status] ?? mutation.data.status} · Итого: {mutation.data.total_price} ₽
          </Text>
        </Alert>
      )}

      {mutation.isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
          {isAxiosError(mutation.error) && mutation.error.response?.status === 409
            ? 'Этот слот уже занят. Выберите другое время.'
            : 'Не удалось создать бронирование. Попробуйте ещё раз.'}
        </Alert>
      )}

      {/* Кнопка */}
      {!isAuthenticated ? (
        <Button fullWidth radius="md" color="orange" leftSection={<IconLogin size={18} />} onClick={login}>
          Войти для бронирования
        </Button>
      ) : (
        <Button
          fullWidth
          radius="md"
          color="orange"
          disabled={!selectedDate || startHour === null || endHour === null || mutation.isPending || mutation.isSuccess}
          loading={mutation.isPending}
          onClick={handleSubmit}
        >
          Забронировать
        </Button>
      )}
    </Stack>
  );
};
