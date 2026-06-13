import { useState } from 'react';
import { Badge, Button, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { AdminListing, AdminService } from '../api/adminService';
import { AdminTable } from '../components/AdminTable';
import { ConfirmAction } from '../components/ConfirmAction';

const PAGE_SIZE = 15;

const STATUS_COLORS: Record<AdminListing['status'], string> = {
  active: 'green',
  paused: 'orange',
  deleted: 'gray',
};
const STATUS_LABELS: Record<AdminListing['status'], string> = {
  active: 'Активно',
  paused: 'Пауза',
  deleted: 'Удалено',
};

export function ListingsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const start = (page - 1) * PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'listings', page],
    queryFn: () => AdminService.getListings(start, start + PAGE_SIZE),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminService.deleteListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
      notifications.show({ message: 'Объявление удалено', color: 'orange' });
    },
    onError: () => notifications.show({ message: 'Ошибка удаления', color: 'red' }),
  });

  const columns = [
    {
      key: 'title',
      label: 'Название',
      render: (row: AdminListing) => (
        <Text size="sm" lineClamp={2} style={{ maxWidth: 280 }}>
          {row.title}
        </Text>
      ),
    },
    {
      key: 'price',
      label: 'Цена/час',
      render: (row: AdminListing) => (
        <Text size="sm">
          {row.price_per_hour.toLocaleString('ru-RU')} ₽
        </Text>
      ),
      width: 120,
    },
    {
      key: 'status',
      label: 'Статус',
      render: (row: AdminListing) => (
        <Badge color={STATUS_COLORS[row.status]}>{STATUS_LABELS[row.status]}</Badge>
      ),
      width: 100,
    },
    {
      key: 'rating',
      label: 'Рейтинг',
      render: (row: AdminListing) => (
        <Text size="sm">
          {row.avg_rating} ★ ({row.review_count})
        </Text>
      ),
      width: 120,
    },
    {
      key: 'created',
      label: 'Создано',
      render: (row: AdminListing) => (
        <Text size="sm">{dayjs(row.created_at).format('DD.MM.YYYY')}</Text>
      ),
      width: 110,
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Объявления</Title>
      <Text c="dimmed" size="sm">
        Всего: {data?.total ?? '...'}
      </Text>
      <AdminTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        actions={listing =>
          listing.status !== 'deleted' ? (
            <ConfirmAction
              trigger={open => (
                <Button size="xs" color="red" variant="light" onClick={open}>
                  Удалить
                </Button>
              )}
              title="Удалить объявление"
              message={`Удалить "${listing.title}"? Все pending/approved бронирования будут отменены.`}
              confirmLabel="Удалить"
              onConfirm={() => deleteMutation.mutateAsync(listing.listing_id)}
            />
          ) : null
        }
      />
    </Stack>
  );
}
