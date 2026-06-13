import { useState } from 'react';
import { Badge, Group, Select, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { AdminBooking, AdminService } from '../api/adminService';
import { AdminTable } from '../components/AdminTable';

const PAGE_SIZE = 15;

const STATUS_COLORS: Record<AdminBooking['status'], string> = {
  pending: 'yellow',
  approved: 'blue',
  active: 'teal',
  completed: 'green',
  cancelled: 'gray',
  rejected: 'red',
  no_show: 'orange',
};

const STATUS_LABELS: Record<AdminBooking['status'], string> = {
  pending: 'Ожидает',
  approved: 'Подтверждено',
  active: 'В процессе',
  completed: 'Завершено',
  cancelled: 'Отменено',
  rejected: 'Отклонено',
  no_show: 'Неявка',
};

export function BookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const start = (page - 1) * PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', page, statusFilter],
    queryFn: () =>
      AdminService.getBookings(start, start + PAGE_SIZE, statusFilter ?? undefined),
  });

  const columns = [
    {
      key: 'renter',
      label: 'Арендатор',
      render: (row: AdminBooking) => (
        <Text size="xs" ff="monospace">
          {row.renter_id.slice(0, 8)}…
        </Text>
      ),
    },
    {
      key: 'listing',
      label: 'Объявление',
      render: (row: AdminBooking) => (
        <Text size="xs" ff="monospace">
          {row.listing?.listing_id?.slice(0, 8) ?? '—'}…
        </Text>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (row: AdminBooking) => (
        <Badge color={STATUS_COLORS[row.status]}>{STATUS_LABELS[row.status]}</Badge>
      ),
      width: 130,
    },
    {
      key: 'price',
      label: 'Сумма',
      render: (row: AdminBooking) => (
        <Text size="sm">{row.total_price.toLocaleString('ru-RU')} ₽</Text>
      ),
      width: 120,
    },
    {
      key: 'start',
      label: 'Начало',
      render: (row: AdminBooking) => (
        <Text size="sm">{dayjs(row.start_time).format('DD.MM.YY HH:mm')}</Text>
      ),
      width: 120,
    },
    {
      key: 'end',
      label: 'Конец',
      render: (row: AdminBooking) => (
        <Text size="sm">{dayjs(row.end_time).format('DD.MM.YY HH:mm')}</Text>
      ),
      width: 120,
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Бронирования</Title>
      <Group>
        <Text c="dimmed" size="sm">
          Всего: {data?.total ?? '...'}
        </Text>
        <Select
          placeholder="Все статусы"
          value={statusFilter}
          onChange={v => {
            setStatusFilter(v);
            setPage(1);
          }}
          clearable
          size="xs"
          data={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          style={{ width: 180 }}
        />
      </Group>
      <AdminTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </Stack>
  );
}
