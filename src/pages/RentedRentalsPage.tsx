import { FC, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Center, SegmentedControl, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { BookingCard, BookingCardSkeleton, ReviewModal } from '@entities/rental';
import { bookingService, BookingItem } from '@shared/api/bookingService';

type Role = 'renter' | 'owner';
type StatusFilter = 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled' | 'no_show';

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Ожидают', value: 'pending' },
  { label: 'Одобрены', value: 'approved' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершены', value: 'completed' },
  { label: 'Отклонены', value: 'rejected' },
  { label: 'Отменены', value: 'cancelled' },
  { label: 'Неявка', value: 'no_show' },
];

interface ReviewTarget {
  bookingId: string;
  reviewType: 'renter_to_listing' | 'owner_to_renter';
}

type BookingCardItem = BookingItem & {
  listingTitle: string;
  listingImage?: string;
  ownerIdForDisplay?: string;
};

function canCancelApproved(startTime: string): boolean {
  return new Date(startTime).getTime() - Date.now() > 24 * 60 * 60 * 1000;
}

function canMarkNoShow(startTime: string): boolean {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return now >= start && now <= start + 60 * 60 * 1000;
}

export const RentedRentalsPage: FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get('booking_id');
  const roleFromParam = searchParams.get('role') as Role | null;

  const [role, setRole] = useState<Role>(roleFromParam === 'owner' ? 'owner' : 'renter');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingExtensionId, setPendingExtensionId] = useState<string | null>(null);
  const [pendingNoShowId, setPendingNoShowId] = useState<string | null>(null);

  const highlightRef = useRef<HTMLDivElement>(null);
  const [highlightActive, setHighlightActive] = useState(!!highlightBookingId);

  // ── Запросы ───────────────────────────────────────────────────────────────
  const { data: renterData, isLoading: renterLoading } = useQuery({
    queryKey: ['my-bookings-as-renter', statusFilter],
    queryFn: () => bookingService.getAsRenter({ status: statusFilter }),
    enabled: role === 'renter',
  });

  const { data: ownerData, isLoading: ownerLoading } = useQuery({
    queryKey: ['my-bookings-as-owner', statusFilter],
    queryFn: () => bookingService.getAsOwner({ status: statusFilter }),
    enabled: role === 'owner',
  });

  // Детальные данные активных бронирований (для pending_extension)
  const rawItems = role === 'renter' ? (renterData?.items ?? []) : (ownerData?.items ?? []);
  const activeItems = statusFilter === 'active' ? rawItems : [];

  const activeDetailQueries = useQueries({
    queries: activeItems.map(b => ({
      queryKey: ['booking-detail', b.booking_id],
      queryFn: () => bookingService.getBooking(b.booking_id),
      staleTime: 30_000,
    })),
  });

  const activeDetailsMap: Record<string, BookingItem> = {};
  activeItems.forEach((b, i) => {
    const data = activeDetailQueries[i]?.data;
    if (data) activeDetailsMap[b.booking_id] = data;
  });

  // ── Мутации ───────────────────────────────────────────────────────────────
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['my-bookings-as-renter'] });
    queryClient.invalidateQueries({ queryKey: ['my-bookings-as-owner'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => bookingService.approveBooking(id),
    onMutate: id => setPendingBookingId(id),
    onSettled: () => setPendingBookingId(null),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => bookingService.rejectBooking({ id }),
    onMutate: id => setPendingBookingId(id),
    onSettled: () => setPendingBookingId(null),
    onSuccess: invalidateAll,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking({ id }),
    onMutate: id => setPendingBookingId(id),
    onSettled: () => setPendingBookingId(null),
    onSuccess: invalidateAll,
  });

  const requestExtensionMutation = useMutation({
    mutationFn: ({ id, newEndTime }: { id: string; newEndTime: string }) =>
      bookingService.requestExtension({ id, newEndTime }),
    onMutate: ({ id }) => setPendingExtensionId(id),
    onSettled: () => setPendingExtensionId(null),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['booking-detail', id] });
      notifications.show({ title: 'Запрос отправлен', message: 'Ожидайте ответа владельца.', color: 'blue' });
    },
    onError: () => {
      notifications.show({ title: 'Ошибка', message: 'Не удалось отправить запрос на продление.', color: 'red' });
    },
  });

  const approveExtensionMutation = useMutation({
    mutationFn: (id: string) => bookingService.approveExtension(id),
    onMutate: id => setPendingExtensionId(id),
    onSettled: () => setPendingExtensionId(null),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['booking-detail', id] });
      invalidateAll();
      notifications.show({ title: 'Продление одобрено', message: 'Время окончания обновлено.', color: 'green' });
    },
  });

  const rejectExtensionMutation = useMutation({
    mutationFn: (id: string) => bookingService.rejectExtension(id),
    onMutate: id => setPendingExtensionId(id),
    onSettled: () => setPendingExtensionId(null),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['booking-detail', id] });
      invalidateAll();
      notifications.show({ title: 'Продление отклонено', message: '', color: 'orange' });
    },
  });

  const markNoShowMutation = useMutation({
    mutationFn: (id: string) => bookingService.markNoShow(id),
    onMutate: id => setPendingNoShowId(id),
    onSettled: () => setPendingNoShowId(null),
    onSuccess: () => {
      invalidateAll();
      notifications.show({ title: 'Неявка отмечена', message: '', color: 'gray' });
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      notifications.show({
        title: 'Нельзя отметить неявку',
        message:
          status === 409
            ? 'Прошло более 60 минут с начала аренды.'
            : 'Произошла ошибка. Попробуйте ещё раз.',
        color: 'red',
      });
    },
  });

  const handleReviewSuccess = (bookingId: string) => {
    setReviewedBookings(prev => new Set(prev).add(bookingId));
  };

  // ── Рендер ────────────────────────────────────────────────────────────────
  const isLoading = role === 'renter' ? renterLoading : ownerLoading;

  useEffect(() => {
    if (!isLoading && highlightBookingId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setHighlightActive(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, highlightBookingId]);

  const bookings: BookingCardItem[] =
    role === 'renter'
      ? (renterData?.items ?? []).map(b => ({
          booking_id: b.booking_id,
          listing_id: b.listing.listing_id,
          renter_id: b.renter_id,
          quantity: b.quantity,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status,
          cancelled_by: b.cancelled_by,
          total_price: b.total_price,
          created_at: b.created_at,
          updated_at: b.updated_at,
          has_my_review: b.has_my_review,
          listingTitle: b.listing.title,
          listingImage: b.listing.cover_url ?? undefined,
          ownerIdForDisplay: b.listing.owner_id,
        }))
      : (ownerData?.items ?? []).map(b => ({
          booking_id: b.booking_id,
          listing_id: b.listing.listing_id,
          renter_id: b.renter_id,
          quantity: b.quantity,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status,
          cancelled_by: b.cancelled_by,
          total_price: b.total_price,
          created_at: b.created_at,
          updated_at: b.updated_at,
          has_my_review: b.has_my_review,
          listingTitle: b.listing.title,
          listingImage: b.listing.cover_url ?? undefined,
        }));

  return (
    <div style={{ padding: '40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <SegmentedControl
          value={role}
          onChange={v => {
            setRole(v as Role);
            setStatusFilter('pending');
          }}
          data={[
            { label: 'Я арендую', value: 'renter' },
            { label: 'Сдаю в аренду', value: 'owner' },
          ]}
          mb={24}
          fullWidth
        />

        <SegmentedControl
          value={statusFilter}
          onChange={v => setStatusFilter(v as StatusFilter)}
          data={STATUS_FILTER_OPTIONS}
          mb={24}
          fullWidth
          size="xs"
        />

        {isLoading && (
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </Stack>
        )}

        {!isLoading && bookings.length === 0 && (
          <Center py={60}>
            <Text c="dimmed">Бронирований нет</Text>
          </Center>
        )}

        {!isLoading && bookings.length > 0 && (
          <Stack gap="md">
            {bookings.map(booking => {
              const hasReview = booking.has_my_review || reviewedBookings.has(booking.booking_id);
              const isHighlighted = highlightActive && booking.booking_id === highlightBookingId;
              const pendingExtension = activeDetailsMap[booking.booking_id]?.pending_extension;

              const getOnReview = () => {
                if (hasReview) return undefined;
                if (role === 'renter') {
                  if (
                    booking.status === 'completed' ||
                    (booking.status === 'cancelled' && booking.cancelled_by === 'owner')
                  ) {
                    return () =>
                      setReviewTarget({ bookingId: booking.booking_id, reviewType: 'renter_to_listing' });
                  }
                } else {
                  if (booking.status === 'completed' || booking.status === 'no_show') {
                    return () =>
                      setReviewTarget({ bookingId: booking.booking_id, reviewType: 'owner_to_renter' });
                  }
                }
                return undefined;
              };

              const getOnCancel = () => {
                if (booking.status === 'pending' && role === 'renter') {
                  return () => cancelMutation.mutate(booking.booking_id);
                }
                if (booking.status === 'approved' && canCancelApproved(booking.start_time)) {
                  return () => cancelMutation.mutate(booking.booking_id);
                }
                return undefined;
              };

              return (
                <div key={booking.booking_id} ref={isHighlighted ? highlightRef : undefined}>
                  <BookingCard
                    booking={booking}
                    role={role}
                    listingTitle={booking.listingTitle}
                    listingImage={booking.listingImage}
                    userIdToShow={
                      role === 'renter' ? booking.ownerIdForDisplay : booking.renter_id
                    }
                    pendingExtension={pendingExtension ?? undefined}
                    hasReview={hasReview}
                    isLoading={pendingBookingId === booking.booking_id}
                    extensionLoading={pendingExtensionId === booking.booking_id}
                    extensionRequestLoading={requestExtensionMutation.isPending && pendingExtensionId === booking.booking_id}
                    noShowLoading={pendingNoShowId === booking.booking_id}
                    highlighted={isHighlighted}
                    onApprove={
                      role === 'owner' && booking.status === 'pending'
                        ? () => approveMutation.mutate(booking.booking_id)
                        : undefined
                    }
                    onReject={
                      role === 'owner' && booking.status === 'pending'
                        ? () => rejectMutation.mutate(booking.booking_id)
                        : undefined
                    }
                    onCancel={getOnCancel()}
                    onReview={getOnReview()}
                    onRequestExtension={
                      role === 'renter' && booking.status === 'active'
                        ? newEndTime =>
                            requestExtensionMutation.mutate({ id: booking.booking_id, newEndTime })
                        : undefined
                    }
                    onApproveExtension={
                      role === 'owner' &&
                      booking.status === 'active' &&
                      pendingExtension?.status === 'pending'
                        ? () => approveExtensionMutation.mutate(booking.booking_id)
                        : undefined
                    }
                    onRejectExtension={
                      role === 'owner' &&
                      booking.status === 'active' &&
                      pendingExtension?.status === 'pending'
                        ? () => rejectExtensionMutation.mutate(booking.booking_id)
                        : undefined
                    }
                    onMarkNoShow={
                      role === 'owner' &&
                      booking.status === 'active' &&
                      canMarkNoShow(booking.start_time)
                        ? () => markNoShowMutation.mutate(booking.booking_id)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </Stack>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          opened={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          bookingId={reviewTarget.bookingId}
          reviewType={reviewTarget.reviewType}
          queryKeysToInvalidate={[
            ['my-bookings-as-renter'],
            ['my-bookings-as-owner'],
          ]}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
