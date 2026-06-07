import { useEffect, useRef } from 'react';
import { ActionIcon, Box, Button, Group, Indicator, Popover, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBell, IconBellRinging, IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth/model/AuthContext';
import { NotificationItem, notificationsService } from '@shared/api';

const UNREAD_REFETCH_INTERVAL = 10_000;

const OWNER_EVENT_TYPES = new Set(['booking.created', 'booking.cancelled_by_renter']);

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getBookingNavTarget = (n: NotificationItem): string | null => {
  let bookingId: string | null = null;
  try {
    const parsed = JSON.parse(n.data);
    bookingId = parsed.booking_id ?? null;
  } catch {}
  if (!bookingId) return null;
  const role = OWNER_EVENT_TYPES.has(n.event_type) ? 'owner' : 'renter';
  return `/rentals-page?booking_id=${bookingId}&role=${role}`;
};

export const NotificationBell = () => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!opened) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [opened, close]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: isAuthenticated ? UNREAD_REFETCH_INTERVAL : false,
    enabled: isAuthenticated,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsService.getNotifications({ pageSize: 20 }),
    enabled: opened,
    staleTime: 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markRead = useMutation({
    mutationFn: (ids: string[]) => notificationsService.markRead(ids),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: invalidate,
  });

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.is_read) markRead.mutate([n.id]);
    const target = getBookingNavTarget(n);
    if (target) {
      close();
      navigate(target);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <div ref={wrapperRef} style={{ display: 'contents' }}>
    <Popover opened={opened} width={340} position="bottom-end" shadow="md" withArrow>
      <Popover.Target>
        <Tooltip label="Уведомления">
          <Indicator
            inline
            disabled={!hasUnread}
            label={unreadCount > 99 ? '99+' : unreadCount}
            size={16}
            color="red"
            offset={4}
          >
            <ActionIcon onClick={toggle} size="lg" variant="outline" color="#EA9432">
              {hasUnread ? <IconBellRinging size={18} /> : <IconBell size={18} />}
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown p={0} onMouseDown={e => e.stopPropagation()}>
        <Group justify="space-between" px={16} py={10} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Text fw={600} size="sm">Уведомления</Text>
          {hasUnread && (
            <Button
              variant="subtle"
              size="xs"
              color="#EA9432"
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Прочитать все
            </Button>
          )}
        </Group>

        <ScrollArea h={360}>
          {isLoading && (
            <Text size="sm" c="dimmed" ta="center" py={32}>
              Загрузка...
            </Text>
          )}

          {!isLoading && !notifications?.items.length && (
            <Text size="sm" c="dimmed" ta="center" py={32}>
              Уведомлений нет
            </Text>
          )}

          {notifications?.items.map(n => {
            const hasTarget = !!getBookingNavTarget(n);
            return (
              <Box
                key={n.id}
                px={16}
                py={12}
                onClick={() => handleNotificationClick(n)}
                style={{
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                  backgroundColor: n.is_read ? undefined : 'var(--mantine-color-orange-light)',
                  cursor: hasTarget ? 'pointer' : 'default',
                  transition: 'background-color 0.15s',
                }}
              >
                <Group gap={8} wrap="nowrap" align="flex-start">
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap" gap={4}>
                      <Text size="sm" fw={n.is_read ? 400 : 600} lineClamp={1} style={{ flex: 1 }}>
                        {n.title}
                      </Text>
                      {!n.is_read && (
                        <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#EA9432', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {n.body}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(n.created_at)}
                    </Text>
                  </Stack>

                  {!n.is_read && (
                    <Tooltip label="Пометить прочитанным">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        style={{ flexShrink: 0 }}
                        onClick={e => {
                          e.stopPropagation();
                          markRead.mutate([n.id]);
                        }}
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Box>
            );
          })}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
    </div>
  );
};
