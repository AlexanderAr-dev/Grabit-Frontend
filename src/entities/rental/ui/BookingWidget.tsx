import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IconAlertCircle, IconCheck, IconChevronLeft, IconChevronRight, IconClock, IconLogin } from '@tabler/icons-react';
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
  bufferHours?: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem > 0 ? `${days} д ${rem} ч` : `${days} д`;
}

export const BookingWidget = ({ listingId, pricePerHour, bufferHours, availableFrom, availableUntil }: BookingWidgetProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, login } = useAuth();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null); // null = same day as startDate
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [displayedDate, setDisplayedDate] = useState(() => dayjs().format('YYYY-MM-DD'));

  const todayStr = useMemo(() => dayjs().startOf('day').format('YYYY-MM-DD'), []);
  const today = useMemo(() => dayjs(todayStr), [todayStr]);
  const visibleMonth = useMemo(() => dayjs(displayedDate).startOf('month'), [displayedDate]);

  const effectiveEndDate = endDate ?? startDate;
  const isMultiDay = !!startDate && !!endDate && endDate !== startDate;

  const noAvailability = availableFrom === null && availableUntil === null;
  const minDate = availableFrom ? dayjs(availableFrom) : null;
  const maxDate = availableUntil ? dayjs(availableUntil) : null;

  // Тепловая карта занятости через /calendar
  const calendarYear = visibleMonth.year();
  const calendarMonth = visibleMonth.month() + 1;

  const { data: calendarData } = useQuery({
    queryKey: ['listing-calendar', listingId, calendarYear, calendarMonth],
    queryFn: () => rentService.getListingCalendar({ listingId, year: calendarYear, month: calendarMonth }),
    staleTime: 5 * 60 * 1000,
    enabled: !noAvailability,
  });

  const utilizationMap = useMemo(() => {
    const map = new Map<string, number | null>();
    calendarData?.days.forEach(d => map.set(d.date, d.utilization));
    return map;
  }, [calendarData]);

  // Слоты начального дня
  const { data: startSlotsData, isLoading: startSlotsLoading } = useQuery({
    queryKey: ['slots', listingId, startDate],
    queryFn: () => rentService.getAvailableSlots({ listingId, date: startDate! }),
    enabled: !!startDate,
  });

  // Слоты конечного дня (только при мультидневной аренде)
  const { data: endSlotsData, isLoading: endSlotsLoading } = useQuery({
    queryKey: ['slots', listingId, endDate],
    queryFn: () => rentService.getAvailableSlots({ listingId, date: endDate! }),
    enabled: !!endDate && endDate !== startDate,
  });

  const startAvailableHours = useMemo(
    () => new Set(startSlotsData?.available_hours ?? []),
    [startSlotsData],
  );

  const endAvailableHours = useMemo(
    () => isMultiDay
      ? new Set(endSlotsData?.available_hours ?? [])
      : startAvailableHours,
    [isMultiDay, endSlotsData, startAvailableHours],
  );

  // Варианты конечного часа для однодневного бронирования (непрерывная цепочка)
  // Учитывает bufferHours: новое бронирование должно заканчиваться не позднее чем
  // за bufferHours до ближайшего занятого слота (бекенд это не проверяет при создании)
  const { options: sameDayEndOptions, bufferApplied: endBufferApplied } = useMemo(() => {
    if (isMultiDay || startHour === null) return { options: [], bufferApplied: false };

    // Первый недоступный час после startHour
    let firstUnavailable: number | null = null;
    for (let h = startHour + 1; h <= 23; h++) {
      if (!startAvailableHours.has(h)) { firstUnavailable = h; break; }
    }

    // Есть ли доступные часы после заблокированной зоны?
    // Если да — это занятый слот (бронирование + буфер), а не просто конец расписания
    let hasAvailableAfterBlocked = false;
    if (firstUnavailable !== null) {
      for (let h = firstUnavailable + 1; h <= 23; h++) {
        if (startAvailableHours.has(h)) { hasAvailableAfterBlocked = true; break; }
      }
    }

    const buf = bufferHours ?? 0;
    const bufferApplied = hasAvailableAfterBlocked && buf > 0;
    const maxEnd = firstUnavailable !== null && bufferApplied
      ? firstUnavailable - buf
      : firstUnavailable ?? 24;

    const options: number[] = [];
    for (let h = startHour + 1; h <= 23; h++) {
      if (!startAvailableHours.has(h - 1)) break;
      if (h > maxEnd) break;
      options.push(h);
    }
    return { options, bufferApplied };
  }, [isMultiDay, startHour, startAvailableHours, bufferHours]);

  const durationHours = useMemo(() => {
    if (!startDate || startHour === null || !effectiveEndDate || endHour === null) return 0;
    return dayjs(effectiveEndDate).hour(endHour).diff(dayjs(startDate).hour(startHour), 'hour');
  }, [startDate, effectiveEndDate, startHour, endHour]);

  const totalPrice = durationHours * pricePerHour;

  const mutation = useMutation({ mutationFn: bookingService.createBooking });

  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setStartHour(null);
    setEndHour(null);
    mutation.reset();
  };

  const handleDateClick = (dateStr: string) => {
    mutation.reset();

    if (!startDate || (endHour !== null)) {
      // Нет начала или уже всё выбрано — начинаем заново
      setStartDate(dateStr);
      setEndDate(null);
      setStartHour(null);
      setEndHour(null);
      return;
    }

    if (startHour === null) {
      // Начальный час ещё не выбран — просто меняем дату начала
      setStartDate(dateStr);
      setEndDate(null);
      return;
    }

    // Начальный час выбран — выбираем дату окончания
    if (dateStr < startDate) {
      // Клик раньше начала — сброс
      setStartDate(dateStr);
      setEndDate(null);
      setStartHour(null);
      setEndHour(null);
      return;
    }

    if (dateStr === startDate) {
      // Клик на тот же день — сброс мультидневного режима
      setEndDate(null);
      setEndHour(null);
      return;
    }

    // Другой день — конечная дата
    setEndDate(dateStr);
    setEndHour(null);
  };

  const getUtilizationBg = (utilization: number | null): string => {
    if (utilization === null) return isDark ? '#2a2a2a' : '#e8e8e8';
    const hue = Math.round((1 - utilization / 100) * 120);
    return `hsl(${hue}, ${isDark ? 55 : 65}%, ${isDark ? 30 : 88}%)`;
  };

  const cardBg = isDark ? '#1a1a1a' : '#fff';
  const borderColor = isDark ? '#2a2a2a' : '#e9ecef';
  const bgSlot = isDark ? '#1a3a1a' : '#e8f5e9';
  const bgSlotUnavailable = isDark ? '#3a1a1a' : '#fff0f0';
  const textSlot = isDark ? '#81c784' : '#2e7d32';
  const textUnavail = isDark ? '#e57373' : '#c62828';

  const HourGrid = ({
    availableHours,
    selected,
    onSelect,
    label,
  }: {
    availableHours: Set<number>;
    selected: number | null;
    onSelect: (h: number) => void;
    label: string;
  }) => (
    <Box
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        padding: '14px 16px',
        backgroundColor: cardBg,
      }}
    >
      <Text size="sm" fw={600} mb={10}>{label}</Text>
      {availableHours.size === 0 ? (
        <Text size="sm" c="dimmed">Нет доступных часов</Text>
      ) : (
        <Flex gap={4} wrap="wrap">
          {Array.from({ length: 24 }, (_, h) => {
            const avail = availableHours.has(h);
            const isSel = selected === h;
            return (
              <Box
                key={h}
                onClick={() => avail && onSelect(h)}
                style={{
                  padding: '5px 8px',
                  borderRadius: 7,
                  cursor: avail ? 'pointer' : 'default',
                  minWidth: 54,
                  textAlign: 'center',
                  backgroundColor: isSel ? '#FF8104' : avail ? bgSlot : bgSlotUnavailable,
                  border: `1px solid ${isSel ? '#FF8104' : avail ? (isDark ? '#388e3c' : '#a5d6a7') : (isDark ? '#5a2020' : '#ffcdd2')}`,
                  transition: 'background-color 0.12s',
                }}
              >
                <Text size="xs" fw={500} c={isSel ? '#fff' : avail ? textSlot : textUnavail}>
                  {h.toString().padStart(2, '0')}:00
                </Text>
                {!avail && (
                  <Text size="xs" c={textUnavail} style={{ fontSize: 9, lineHeight: 1.2 }}>занято</Text>
                )}
              </Box>
            );
          })}
        </Flex>
      )}
    </Box>
  );

  if (noAvailability) {
    return (
      <Stack gap="md">
        <Text size="xl" fw={600}>Забронировать</Text>
        <Alert icon={<IconAlertCircle size={16} />} color="gray" radius="md">
          <Text size="sm">Объявление сейчас недоступно для бронирования — расписание не задано или все периоды истекли.</Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text size="xl" fw={600}>Забронировать</Text>

      {/* Инфо о буфере */}
      {!!bufferHours && bufferHours > 0 && (
        <Flex align="center" gap={6} px={2}>
          <IconClock size={14} color="#868e96" />
          <Text size="xs" c="dimmed">
            Буфер между арендами: <b>{bufferHours} ч</b> — время на подготовку предмета
          </Text>
        </Flex>
      )}

      {/* Календарь */}
      <Box
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: '20px 20px 16px',
          backgroundColor: cardBg,
          overflow: 'hidden',
        }}
      >
        {/* Подсказка по выбору */}
        <Text size="xs" c="dimmed" mb={10} ta="center">
          {!startDate
            ? 'Выберите дату начала аренды'
            : startHour === null
              ? 'Выберите время начала ниже'
              : isMultiDay
                ? `${dayjs(startDate).locale('ru').format('D MMM')} → ${dayjs(endDate!).locale('ru').format('D MMM')} · выберите время окончания`
                : 'Выберите дату окончания или другой день для мультидневной аренды'}
        </Text>

        <Calendar
          locale="ru"
          maxLevel="month"
          date={displayedDate}
          onDateChange={setDisplayedDate}
          previousIcon={<IconChevronLeft size={27} stroke={2.5} />}
          nextIcon={<IconChevronRight size={27} stroke={2.5} />}
          getDayProps={date => {
            const d = dayjs(date);
            const dateStr = d.format('YYYY-MM-DD');
            const isPast = d.isBefore(today, 'day');
            const isOutsideRange =
              (minDate ? d.isBefore(minDate, 'day') : false) ||
              (maxDate ? d.isAfter(maxDate, 'day') : false);

            if (isPast || isOutsideRange) {
              return {
                disabled: true,
                style: {
                  backgroundColor: isDark ? '#222' : '#f0f0f0',
                  color: isDark ? '#444' : '#bbb',
                  borderRadius: 8,
                  border: '2px solid transparent',
                  cursor: 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                },
              };
            }

            const isStart = dateStr === startDate;
            const isEnd = !!effectiveEndDate && dateStr === effectiveEndDate && isMultiDay;
            const isInRange = isMultiDay && !!startDate && !!endDate
              && dateStr > startDate && dateStr < endDate;
            const utilization = utilizationMap.get(dateStr);

            const occupancyBg = !isStart && !isEnd && !isInRange && utilization !== undefined
              ? getUtilizationBg(utilization)
              : undefined;

            return {
              onClick: () => handleDateClick(dateStr),
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isStart || isEnd
                  ? '#FF8104'
                  : isInRange
                    ? 'rgba(255,129,4,0.15)'
                    : occupancyBg,
                color: isStart || isEnd ? '#fff' : undefined,
                fontWeight: isStart || isEnd ? 700 : undefined,
                border: isStart || isEnd
                  ? '2px solid #FF8104'
                  : isInRange
                    ? '2px solid rgba(255,129,4,0.3)'
                    : '2px solid transparent',
                borderRadius: 8,
              },
            };
          }}
          styles={{
            month: { width: '100%', tableLayout: 'fixed' as const },
            monthCell: { padding: '3px' },
            day: { width: '100%', height: 46, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' },
            calendarHeader: { marginBottom: 14, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
            calendarHeaderControl: { width: 44, height: 44, minWidth: 44, flex: 'none' },
            calendarHeaderLevel: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', cursor: 'default', pointerEvents: 'none', flex: 'none', padding: '0 4px' },
            weekday: { textAlign: 'center', fontSize: 11, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em', color: isDark ? '#888' : '#aaa' },
          }}
        />
      </Box>

      {/* Время начала */}
      {startDate && (
        startSlotsLoading
          ? <Flex align="center" gap="sm"><Loader size="xs" /><Text size="sm" c="dimmed">Загрузка слотов...</Text></Flex>
          : <HourGrid
              availableHours={startAvailableHours}
              selected={startHour}
              onSelect={h => { setStartHour(h); setEndHour(null); mutation.reset(); }}
              label={`${dayjs(startDate).locale('ru').format('D MMMM')} — время начала`}
            />
      )}

      {/* Время окончания — однодневное */}
      {!isMultiDay && startHour !== null && (
        <Box
          style={{ border: `1px solid ${borderColor}`, borderRadius: 14, padding: '14px 16px', backgroundColor: cardBg }}
        >
          <Text size="sm" fw={600} mb={10}>
            {dayjs(startDate!).locale('ru').format('D MMMM')} — время окончания
          </Text>
          {sameDayEndOptions.length === 0 ? (
            <Text size="sm" c="dimmed">
              {endBufferApplied
                ? `Нет доступных часов — слишком близко к следующему бронированию (буфер: ${bufferHours} ч). Попробуйте выбрать более раннее время начала.`
                : 'Нет доступных часов для продолжения'}
            </Text>
          ) : (
            <Flex gap={4} wrap="wrap">
              {sameDayEndOptions.map(h => {
                const isSel = endHour === h;
                return (
                  <Box
                    key={h}
                    onClick={() => { setEndHour(h); mutation.reset(); }}
                    style={{
                      padding: '5px 8px', borderRadius: 7, cursor: 'pointer', minWidth: 54, textAlign: 'center',
                      backgroundColor: isSel ? '#FF8104' : bgSlot,
                      border: `1px solid ${isSel ? '#FF8104' : isDark ? '#388e3c' : '#a5d6a7'}`,
                      transition: 'background-color 0.12s',
                    }}
                  >
                    <Text size="xs" fw={500} c={isSel ? '#fff' : textSlot}>
                      {h.toString().padStart(2, '0')}:00
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          )}
          <Text size="xs" c="dimmed" mt={10}>
            💡 Или кликните на другой день в календаре для мультидневной аренды
          </Text>
        </Box>
      )}

      {/* Время окончания — мультидневное */}
      {isMultiDay && startHour !== null && (
        endSlotsLoading
          ? <Flex align="center" gap="sm"><Loader size="xs" /><Text size="sm" c="dimmed">Загрузка слотов...</Text></Flex>
          : <HourGrid
              availableHours={endAvailableHours}
              selected={endHour}
              onSelect={h => { setEndHour(h); mutation.reset(); }}
              label={`${dayjs(endDate!).locale('ru').format('D MMMM')} — время окончания`}
            />
      )}

      {/* Итог */}
      {durationHours > 0 && (
        <Box p="sm" style={{ borderRadius: 12, backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', border: `1px solid ${borderColor}` }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {formatDuration(durationHours)} × {pricePerHour} ₽/ч
            </Text>
            <Text fw={700} size="md">{totalPrice} ₽</Text>
          </Group>
          {isMultiDay && (
            <Text size="xs" c="dimmed" mt={4}>
              Аренда: {dayjs(startDate!).locale('ru').format('D MMM HH:mm').replace('HH', startHour!.toString().padStart(2, '0')).replace(':mm', ':00')} — {dayjs(endDate!).locale('ru').format('D MMM HH:mm').replace('HH', endHour!.toString().padStart(2, '0')).replace(':mm', ':00')}
            </Text>
          )}
        </Box>
      )}

      {/* Статус */}
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

      {/* Кнопки */}
      <Stack gap="xs">
        {!isAuthenticated ? (
          <Button fullWidth radius="md" color="orange" leftSection={<IconLogin size={18} />} onClick={login}>
            Войти для бронирования
          </Button>
        ) : (
          <Button
            fullWidth radius="md" color="orange"
            disabled={!startDate || startHour === null || endHour === null || durationHours <= 0 || mutation.isPending || mutation.isSuccess}
            loading={mutation.isPending}
            onClick={() => {
              if (!startDate || !effectiveEndDate || startHour === null || endHour === null) return;
              mutation.mutate({
                listing_id: listingId,
                quantity: 1,
                start_time: dayjs(startDate).startOf('day').hour(startHour).toISOString(),
                end_time: dayjs(effectiveEndDate).startOf('day').hour(endHour).toISOString(),
              });
            }}
          >
            Забронировать
          </Button>
        )}
        {(startDate || endDate) && !mutation.isSuccess && (
          <Button fullWidth radius="md" variant="subtle" color="gray" onClick={resetSelection}>
            Сбросить выбор
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
