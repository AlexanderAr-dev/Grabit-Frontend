import { FC } from 'react';
import { Button, Card, Group, Image, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import { componentsTheme } from '@shared/config';
import { BookingItem } from '@shared/api/bookingService';
import { UserMiniCard } from '@entities/user';

const STATUS_LABELS: Record<BookingItem['status'], string> = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  active: 'Активно',
  completed: 'Завершено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

const STATUS_COLORS: Record<BookingItem['status'], string> = {
  pending: '#FF8104',
  approved: '#3B82F6',
  active: '#22C55E',
  completed: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#EF4444',
};

interface BookingCardProps {
  booking: BookingItem;
  role: 'renter' | 'owner';
  listingTitle: string;
  listingImage?: string;
  userIdToShow?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onReview?: () => void;
  hasReview?: boolean;
  isLoading?: boolean;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function stopProp(fn?: () => void) {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };
}

export const BookingCard: FC<BookingCardProps> = ({
  booking,
  role,
  listingTitle,
  listingImage,
  userIdToShow,
  onApprove,
  onReject,
  onCancel,
  onReview,
  hasReview,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const themeStyles = componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles['primary'];

  const canApprove = !!onApprove;
  const canReject = !!onReject;
  const canCancel = !!onCancel;
  const canReview = !!onReview && !hasReview;

  const status = booking.status;

  return (
    <Card
      shadow="sm"
      radius="lg"
      withBorder
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.text,
        border: `1px solid ${variantStyles.borderColor}`,
        marginBottom: '16px',
        cursor: 'pointer',
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

          {/* Цена */}
          <Text size="md" fw={600} c={variantStyles.text}>
            {booking.total_price} ₽
          </Text>

          {/* Мини профиль */}
          {userIdToShow && (
            <div onClick={e => e.stopPropagation()}>
              <UserMiniCard
                userId={userIdToShow}
                ratingType={role === 'renter' ? 'owner' : 'renter'}
              />
            </div>
          )}

          {/* Кнопки действий */}
          {(canApprove || canReject || canCancel || canReview || (status === 'completed' && hasReview)) && (
            <Group gap="xs" mt={4} onClick={e => e.stopPropagation()}>
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
              {canReview && (
                <Button size="sm" variant="filled" color="orange" onClick={stopProp(onReview)}>
                  {role === 'owner' ? 'Отзыв об арендаторе' : 'Оставить отзыв'}
                </Button>
              )}
              {status === 'completed' && hasReview && (
                <Text size="sm" c="dimmed">
                  Отзыв оставлен
                </Text>
              )}
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );
};
