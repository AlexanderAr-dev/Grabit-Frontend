import { FC, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Center, SegmentedControl, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BookingCard, BookingCardSkeleton, ReviewModal } from '@entities/rental';
import { bookingService, BookingItem } from '@shared/api/bookingService';

type Role = 'renter' | 'owner';
type StatusFilter = 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Ожидают', value: 'pending' },
  { label: 'Одобрены', value: 'approved' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершены', value: 'completed' },
  { label: 'Отклонены', value: 'rejected' },
  { label: 'Отменены', value: 'cancelled' },
];

interface ReviewTarget {
  bookingId: string;
  reviewType: 'renter_to_listing' | 'owner_to_renter';
}

// Тип, который передаётся в BookingCard (включает listing_id для навигации)
type BookingCardItem = BookingItem & {
  listingTitle: string;
  listingImage?: string;
  ownerIdForDisplay?: string;
};

export const RentedRentalsPage: FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get('booking_id');
  const roleFromParam = searchParams.get('role') as Role | null;

  const [role, setRole] = useState<Role>(roleFromParam === 'owner' ? 'owner' : 'renter');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewedAsRenter, setReviewedAsRenter] = useState<Set<string>>(new Set());
  const [reviewedAsOwner, setReviewedAsOwner] = useState<Set<string>>(new Set());
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const highlightRef = useRef<HTMLDivElement>(null);
  const [highlightActive, setHighlightActive] = useState(!!highlightBookingId);

  const statusParam = statusFilter;

  // ── Арендатор: мои бронирования ───────────────────────────────────────────
  const { data: renterData, isLoading: renterLoading } = useQuery({
    queryKey: ['my-bookings-as-renter', statusParam],
    queryFn: () => bookingService.getAsRenter({ status: statusParam }),
    enabled: role === 'renter',
  });

  // ── Владелец: бронирования моих объявлений ────────────────────────────────
  const { data: ownerData, isLoading: ownerLoading } = useQuery({
    queryKey: ['my-bookings-as-owner', statusParam],
    queryFn: () => bookingService.getAsOwner({ status: statusParam }),
    enabled: role === 'owner',
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

  const handleReviewSuccess = (bookingId: string) => {
    if (role === 'renter') {
      setReviewedAsRenter(prev => new Set(prev).add(bookingId));
    } else {
      setReviewedAsOwner(prev => new Set(prev).add(bookingId));
    }
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
          total_price: b.total_price,
          created_at: b.created_at,
          updated_at: b.updated_at,
          listingTitle: b.listing.title,
          listingImage: b.listing.cover_url,
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
          total_price: b.total_price,
          created_at: b.created_at,
          updated_at: b.updated_at,
          listingTitle: b.listing.title,
          listingImage: b.listing.cover_url,
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
              const hasReview =
                role === 'renter'
                  ? reviewedAsRenter.has(booking.booking_id)
                  : reviewedAsOwner.has(booking.booking_id);
              const isHighlighted = highlightActive && booking.booking_id === highlightBookingId;

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
                    hasReview={hasReview}
                    isLoading={pendingBookingId === booking.booking_id}
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
                    onCancel={
                      booking.status === 'pending' || booking.status === 'approved'
                        ? () => cancelMutation.mutate(booking.booking_id)
                        : undefined
                    }
                    onReview={
                      booking.status === 'completed'
                        ? () =>
                            setReviewTarget({
                              bookingId: booking.booking_id,
                              reviewType: role === 'renter' ? 'renter_to_listing' : 'owner_to_renter',
                            })
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
