import { FC, useState } from 'react';
import { Button, Card, Group, Image, Modal, Stack, Text, TextInput, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessageCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { chatService } from '@shared/api';
import { componentsTheme } from '@shared/config';
import { BookingExtension, BookingItem } from '@shared/api/bookingService';
import { UserMiniCard } from '@entities/user';

const STATUS_LABELS: Record<BookingItem['status'], string> = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  active: 'Активно',
  completed: 'Завершено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
  no_show: 'Неявка',
};

const STATUS_COLORS: Record<BookingItem['status'], string> = {
  pending: '#FF8104',
  approved: '#3B82F6',
  active: '#22C55E',
  completed: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#EF4444',
  no_show: '#6B7280',
};

interface BookingCardProps {
  booking: BookingItem;
  role: 'renter' | 'owner';
  listingTitle: string;
  listingImage?: string;
  userIdToShow?: string;
  pendingExtension?: BookingExtension;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onReview?: () => void;
  onRequestExtension?: (newEndTime: string) => void;
  onApproveExtension?: () => void;
  onRejectExtension?: () => void;
  onMarkNoShow?: () => void;
  hasReview?: boolean;
  isLoading?: boolean;
  extensionLoading?: boolean;
  extensionRequestLoading?: boolean;
  noShowLoading?: boolean;
  highlighted?: boolean;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalDatetimeMin(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stopProp(fn?: () => void) {
  return (e: React.MouseEvent) => { e.stopPropagation(); fn?.(); };
}

export const BookingCard: FC<BookingCardProps> = ({
  booking,
  role,
  listingTitle,
  listingImage,
  userIdToShow,
  pendingExtension,
  onApprove,
  onReject,
  onCancel,
  onReview,
  onRequestExtension,
  onApproveExtension,
  onRejectExtension,
  onMarkNoShow,
  hasReview,
  isLoading,
  extensionLoading,
  extensionRequestLoading,
  noShowLoading,
  highlighted,
}) => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const variantStyles = componentsTheme.cardTheme[colorScheme].primary;
  const [chatLoading, setChatLoading] = useState(false);
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');

  const status = booking.status;
  const canApprove = !!onApprove;
  const canReject = !!onReject;
  const canCancel = !!onCancel;
  const canReview = !!onReview && !hasReview;
  const hasPendingExtension = pendingExtension?.status === 'pending';

  const handleGoToChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatLoading(true);
    try {
      if (role === 'owner') {
        const { items } = await chatService.getConversations({ listing_id: booking.listing_id });
        const conv = items.find(c => c.renter_id === booking.renter_id);
        if (conv) {
          navigate(`/chats/${conv.conversation_id}`, { state: { conversation: conv } });
        } else {
          notifications.show({
            title: 'Чат недоступен',
            message: 'Диалог будет создан автоматически, когда арендатор отправит первое сообщение.',
            color: 'orange',
          });
        }
      } else {
        const conversation = await chatService.createOrGetConversation(booking.listing_id);
        navigate(`/chats/${conversation.conversation_id}`, { state: { conversation } });
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleExtensionSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newEndTime) return;
    const newEnd = new Date(newEndTime);
    if (newEnd <= new Date(booking.end_time)) return;
    onRequestExtension?.(newEnd.toISOString());
    setExtensionModalOpen(false);
    setNewEndTime('');
  };

  return (
    <>
      <Card
        shadow="sm"
        radius="lg"
        withBorder
        style={{
          backgroundColor: variantStyles.backgroundColor,
          color: variantStyles.text,
          border: highlighted ? '2px solid #FF8104' : `1px solid ${variantStyles.borderColor}`,
          boxShadow: highlighted ? '0 0 0 3px rgba(255, 129, 4, 0.15)' : undefined,
          marginBottom: '16px',
          cursor: 'pointer',
          transition: 'border 0.6s ease, box-shadow 0.6s ease',
        }}
        onClick={() => navigate(`/rent-page/${booking.listing_id}`)}
      >
        <Group align="flex-start" gap="md" wrap="nowrap">
          <Image
            src={listingImage ?? 'https://placehold.co/120x160?text=?'}
            radius="md"
            alt={listingTitle}
            w={120}
            h={160}
            fit="cover"
            style={{ minWidth: 120, flexShrink: 0 }}
            visibleFrom="xs"
          />

          <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
            {/* Заголовок + статус */}
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
              <Text size="lg" fw={700} c={variantStyles.text} lineClamp={2} style={{ flex: 1 }}>
                {listingTitle}
              </Text>
              <span
                style={{
                  backgroundColor: STATUS_COLORS[status],
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '3px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {STATUS_LABELS[status]}
              </span>
            </Group>

            {/* Даты */}
            <Text size="md" c={variantStyles.secondaryText}>
              {formatDateTime(booking.start_time)} — {formatDateTime(booking.end_time)}
            </Text>

            {/* Цена + количество */}
            <Group gap="md">
              <Text size="md" fw={600} c={variantStyles.text}>
                {booking.total_price} ₽
              </Text>
              {booking.quantity > 1 && (
                <Text size="sm" c="dimmed">× {booking.quantity} шт.</Text>
              )}
            </Group>

            {/* Кем отменено */}
            {status === 'cancelled' && booking.cancelled_by && (
              <Text size="sm" c="dimmed">
                Отменено:{' '}
                {booking.cancelled_by === 'owner'
                  ? 'владельцем'
                  : booking.cancelled_by === 'renter'
                  ? 'арендатором'
                  : 'системой'}
              </Text>
            )}

            {/* Мини профиль */}
            {userIdToShow && (
              <div onClick={e => e.stopPropagation()}>
                <UserMiniCard userId={userIdToShow} ratingType={role === 'renter' ? 'owner' : 'renter'} />
              </div>
            )}

            {/* Блок продления — арендатор */}
            {role === 'renter' && status === 'active' && hasPendingExtension && (
              <Text size="sm" c="blue">
                Запрос на продление до {formatDateTime(pendingExtension!.new_end_time)} — ожидает ответа владельца
              </Text>
            )}

            {/* Блок продления — владелец */}
            {role === 'owner' && status === 'active' && hasPendingExtension && (
              <Stack gap={6} onClick={e => e.stopPropagation()}>
                <Text size="sm" c="blue" fw={500}>
                  Запрос продления до {formatDateTime(pendingExtension!.new_end_time)}
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    color="green"
                    onClick={stopProp(onApproveExtension)}
                    loading={extensionLoading}
                  >
                    Одобрить продление
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="outline"
                    onClick={stopProp(onRejectExtension)}
                    loading={extensionLoading}
                  >
                    Отклонить продление
                  </Button>
                </Group>
              </Stack>
            )}

            {/* Кнопки действий */}
            <Group gap="xs" mt={4} wrap="wrap" onClick={e => e.stopPropagation()}>
              {canApprove && (
                <Button size="sm" color="green" onClick={stopProp(onApprove)} loading={isLoading}>
                  Одобрить
                </Button>
              )}
              {canReject && (
                <Button size="sm" color="red" variant="outline" onClick={stopProp(onReject)} loading={isLoading}>
                  Отклонить
                </Button>
              )}
              {canCancel && (
                <Button size="sm" color="red" variant="filled" onClick={stopProp(onCancel)} loading={isLoading}>
                  Отменить
                </Button>
              )}

              {/* Продлить аренду (арендатор, active, нет pending запроса) */}
              {role === 'renter' && status === 'active' && !hasPendingExtension && !!onRequestExtension && (
                <Button
                  size="sm"
                  variant="outline"
                  color="blue"
                  loading={extensionRequestLoading}
                  onClick={e => { e.stopPropagation(); setExtensionModalOpen(true); }}
                >
                  Продлить аренду
                </Button>
              )}

              {/* Неявка (владелец, active) */}
              {role === 'owner' && status === 'active' && !!onMarkNoShow && (
                <Button
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={stopProp(onMarkNoShow)}
                  loading={noShowLoading}
                >
                  Неявка
                </Button>
              )}

              {canReview && (
                <Button size="sm" variant="filled" color="orange" onClick={stopProp(onReview)}>
                  {role === 'owner' ? 'Отзыв об арендаторе' : 'Оставить отзыв'}
                </Button>
              )}
              {hasReview && (
                status === 'completed' ||
                status === 'no_show' ||
                status === 'cancelled'
              ) && (
                <Text size="sm" c="dimmed">Отзыв оставлен</Text>
              )}

              <Button
                size="sm"
                variant="light"
                color="orange"
                leftSection={<IconMessageCircle size={15} />}
                loading={chatLoading}
                onClick={handleGoToChat}
              >
                В чат
              </Button>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Modal
        opened={extensionModalOpen}
        onClose={() => { setExtensionModalOpen(false); setNewEndTime(''); }}
        title="Продление аренды"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Текущее окончание: <strong>{formatDateTime(booking.end_time)}</strong>
          </Text>
          <TextInput
            type="datetime-local"
            label="Новое время окончания"
            value={newEndTime}
            onChange={e => setNewEndTime(e.target.value)}
            min={toLocalDatetimeMin(booking.end_time)}
          />
          <Button
            fullWidth
            color="orange"
            disabled={!newEndTime}
            onClick={handleExtensionSubmit}
          >
            Отправить запрос
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
