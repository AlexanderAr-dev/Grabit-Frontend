import { useState } from 'react';
import { Badge, Button, Modal, Select, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { AdminService, AdminUser } from '../api/adminService';
import { AdminTable } from '../components/AdminTable';
import { ConfirmAction } from '../components/ConfirmAction';

const PAGE_SIZE = 15;

const PREMIUM_PLANS = [
  { value: 'weekly', label: '7 дней (weekly)' },
  { value: 'monthly', label: '30 дней (monthly)' },
  { value: 'quarterly', label: '90 дней (quarterly)' },
  { value: 'yearly', label: '365 дней (yearly)' },
  { value: 'free', label: 'Снять подписку' },
];

function UserStatus({ user }: { user: AdminUser }) {
  if (user.deleted_at) return <Badge color="gray">Удалён</Badge>;
  if (user.blocked) return <Badge color="red">Заблокирован</Badge>;
  return <Badge color="green">Активен</Badge>;
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [premiumPlan, setPremiumPlan] = useState<Parameters<typeof AdminService.setPremium>[1]>('monthly');
  const [premiumOpened, { open: openPremium, close: closePremium }] = useDisclosure(false);
  const qc = useQueryClient();

  const start = (page - 1) * PAGE_SIZE;
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => AdminService.getUsers(start, start + PAGE_SIZE),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => AdminService.blockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ message: 'Пользователь заблокирован', color: 'red' });
    },
    onError: () => notifications.show({ message: 'Ошибка блокировки', color: 'red' }),
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => AdminService.unblockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ message: 'Пользователь разблокирован', color: 'green' });
    },
    onError: () => notifications.show({ message: 'Ошибка разблокировки', color: 'red' }),
  });

  const premiumMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: Parameters<typeof AdminService.setPremium>[1] }) =>
      AdminService.setPremium(id, plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ message: 'Подписка обновлена', color: 'green' });
      closePremium();
    },
    onError: () => notifications.show({ message: 'Ошибка обновления подписки', color: 'red' }),
  });

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (u: AdminUser) => <Text size="sm">{u.email}</Text>,
    },
    {
      key: 'username',
      label: 'Username',
      render: (u: AdminUser) => (
        <Text size="sm" c="dimmed">
          @{u.username}
        </Text>
      ),
    },
    {
      key: 'name',
      label: 'Имя',
      render: (u: AdminUser) => (
        <Text size="sm">
          {u.first_name} {u.last_name}
        </Text>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (u: AdminUser) => <UserStatus user={u} />,
    },
    {
      key: 'created',
      label: 'Регистрация',
      render: (u: AdminUser) => (
        <Text size="sm">{dayjs(u.created_at).format('DD.MM.YYYY')}</Text>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Title order={3}>Пользователи</Title>
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
        actions={user => (
          <>
            {user.blocked ? (
              <ConfirmAction
                trigger={open => (
                  <Button size="xs" color="green" variant="light" onClick={open}>
                    Разблок.
                  </Button>
                )}
                title="Разблокировать пользователя"
                message={`Разблокировать ${user.email}?`}
                confirmLabel="Разблокировать"
                confirmColor="green"
                onConfirm={() => unblockMutation.mutateAsync(user.id)}
              />
            ) : (
              !user.deleted_at && (
                <ConfirmAction
                  trigger={open => (
                    <Button size="xs" color="red" variant="light" onClick={open}>
                      Блок.
                    </Button>
                  )}
                  title="Заблокировать пользователя"
                  message={`Заблокировать ${user.email}? Все активные сессии будут завершены, объявления поставлены на паузу.`}
                  confirmLabel="Заблокировать"
                  confirmColor="red"
                  onConfirm={() => blockMutation.mutateAsync(user.id)}
                />
              )
            )}
            <Button
              size="xs"
              variant="light"
              color="orange"
              onClick={() => {
                setSelectedUser(user);
                setPremiumPlan('monthly');
                openPremium();
              }}
            >
              Premium
            </Button>
          </>
        )}
      />

      <Modal
        opened={premiumOpened}
        onClose={closePremium}
        title="Управление подпиской"
        centered
        size="sm"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            {selectedUser?.email}
          </Text>
          <Select
            label="Тариф"
            value={premiumPlan}
            onChange={v => v && setPremiumPlan(v as Parameters<typeof AdminService.setPremium>[1])}
            data={PREMIUM_PLANS}
          />
          <Button
            mt="xs"
            color={premiumPlan === 'free' ? 'gray' : 'orange'}
            loading={premiumMutation.isPending}
            onClick={() =>
              selectedUser &&
              premiumMutation.mutate({ id: selectedUser.id, plan: premiumPlan })
            }
          >
            Применить
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
