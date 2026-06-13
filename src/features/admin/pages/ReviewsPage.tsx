import { useState } from 'react';
import { Badge, Button, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { AdminReview, AdminService } from '../api/adminService';
import { AdminTable } from '../components/AdminTable';
import { ConfirmAction } from '../components/ConfirmAction';

const PAGE_SIZE = 15;

const TYPE_LABELS: Record<AdminReview['review_type'], string> = {
  renter_to_listing: 'Арендатор → Объявление',
  renter_to_owner: 'Арендатор → Владелец',
  owner_to_renter: 'Владелец → Арендатор',
};

export function ReviewsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const start = (page - 1) * PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page],
    queryFn: () => AdminService.getReviews(start, start + PAGE_SIZE),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      notifications.show({ message: 'Отзыв удалён', color: 'orange' });
    },
    onError: () => notifications.show({ message: 'Ошибка удаления', color: 'red' }),
  });

  const columns = [
    {
      key: 'type',
      label: 'Тип',
      render: (row: AdminReview) => (
        <Text size="xs">{TYPE_LABELS[row.review_type]}</Text>
      ),
      width: 200,
    },
    {
      key: 'rating',
      label: 'Оценка',
      render: (row: AdminReview) => <Badge color="yellow">{row.rating} ★</Badge>,
      width: 80,
    },
    {
      key: 'comment',
      label: 'Комментарий',
      render: (row: AdminReview) => (
        <Text size="xs" lineClamp={2} style={{ maxWidth: 320 }}>
          {row.comment || '—'}
        </Text>
      ),
    },
    {
      key: 'author',
      label: 'Автор',
      render: (row: AdminReview) => (
        <Text size="xs" ff="monospace">
          {row.author_id.slice(0, 8)}…
        </Text>
      ),
      width: 110,
    },
    {
      key: 'created',
      label: 'Дата',
      render: (row: AdminReview) => (
        <Text size="sm">{dayjs(row.created_at).format('DD.MM.YYYY')}</Text>
      ),
      width: 110,
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Отзывы</Title>
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
        actions={review => (
          <ConfirmAction
            trigger={open => (
              <Button size="xs" color="red" variant="light" onClick={open}>
                Удалить
              </Button>
            )}
            title="Удалить отзыв"
            message="Удалить отзыв? Рейтинг объявления будет пересчитан автоматически."
            confirmLabel="Удалить"
            onConfirm={() => deleteMutation.mutateAsync(review.id)}
          />
        )}
      />
    </Stack>
  );
}
