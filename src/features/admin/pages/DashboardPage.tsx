import { Alert, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { AdminService } from '../api/adminService';

interface StatCardProps {
  label: string;
  value: number | string;
  accent: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Paper p="lg" radius="md" style={{ borderLeft: `4px solid ${accent}` }}>
      <Text size="xs" tt="uppercase" c="dimmed" fw={600} mb={6}>
        {label}
      </Text>
      <Text size="xl" fw={700} style={{ color: accent }}>
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      </Text>
    </Paper>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: AdminService.getStats,
  });

  if (isLoading) {
    return <Text c="dimmed">Загрузка статистики...</Text>;
  }

  if (isError) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />} title="Ошибка">
        Не удалось загрузить статистику. Возможно, у вас нет прав администратора.
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <Stack gap="xl">
      <Title order={3}>Статистика платформы</Title>

      <div>
        <Text size="sm" fw={600} c="dimmed" mb="sm">
          ПОЛЬЗОВАТЕЛИ
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatCard label="Всего" value={stats.total_users} accent="#FF8104" />
          <StatCard label="Новых за 7 дней" value={stats.new_users_7d} accent="#4CAF50" />
          <StatCard label="Заблокированных" value={stats.blocked_users} accent="#e53935" />
          <StatCard label="Удалённых" value={stats.deleted_users} accent="#9E9E9E" />
        </SimpleGrid>
      </div>

      <div>
        <Text size="sm" fw={600} c="dimmed" mb="sm">
          ОБЪЯВЛЕНИЯ
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3 }}>
          <StatCard label="Активных" value={stats.listings_by_status.active} accent="#2196F3" />
          <StatCard label="На паузе" value={stats.listings_by_status.paused} accent="#FF9800" />
          <StatCard label="Удалённых" value={stats.listings_by_status.deleted} accent="#9E9E9E" />
        </SimpleGrid>
      </div>

      <div>
        <Text size="sm" fw={600} c="dimmed" mb="sm">
          БРОНИРОВАНИЯ
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatCard label="Ожидают" value={stats.bookings_by_status.pending} accent="#FFC107" />
          <StatCard label="В процессе" value={stats.bookings_by_status.active} accent="#673AB7" />
          <StatCard label="Завершено" value={stats.bookings_by_status.completed} accent="#4CAF50" />
          <StatCard label="Отменено" value={stats.bookings_by_status.cancelled} accent="#9E9E9E" />
        </SimpleGrid>
      </div>

      <div>
        <Text size="sm" fw={600} c="dimmed" mb="sm">
          ДОХОДЫ И ОТЗЫВЫ
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 2 }}>
          <StatCard
            label="Выручка (completed)"
            value={`${stats.total_revenue.toLocaleString('ru-RU')} ₽`}
            accent="#FF8104"
          />
          <StatCard label="Всего отзывов" value={stats.total_reviews} accent="#2196F3" />
        </SimpleGrid>
      </div>
    </Stack>
  );
}
