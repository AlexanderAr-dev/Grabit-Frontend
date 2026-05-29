import { FC, useState } from 'react';
import { Center, Loader, SegmentedControl, Stack, Text } from '@mantine/core';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { BookingCard, ReviewModal } from '@entities/rental';
import { bookingService, BookingItem } from '@shared/api/bookingService';
import { rentService } from '@shared/api/rentService';

type Role = 'renter' | 'owner';
type StatusFilter = 'all' | 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Все', value: 'all' },
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

export const RentedRentalsPage: FC = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>('renter');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewedAsRenter, setReviewedAsRenter] = useState<Set<string>>(new Set());
  const [reviewedAsOwner, setReviewedAsOwner] = useState<Set<string>>(new Set());
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const statusParam = statusFilter === 'all' ? undefined : statusFilter;

  // ── Рентер: мои бронирования ──────────────────────────────────────────────
  const { data: renterData, isLoading: renterLoading } = useQuery({
    queryKey: ['my-bookings', statusParam],
    queryFn: () => bookingService.getMyBookings({ status: statusParam }),
    enabled: role === 'renter',
  });

  // ── Рентер: данные листингов для отображения названий ─────────────────────
  const uniqueRenterListingIds = [
    ...new Set((renterData?.items ?? []).map(b => b.listing_id).filter(Boolean)),
  ];

  const renterListingQueries = useQueries({
    queries: uniqueRenterListingIds.map(id => ({
      queryKey: ['rentAd', id],
      queryFn: async () => {
        const res = await rentService.getRentInfo(id);
        return res.data.data;
      },
      enabled: role === 'renter' && !!renterData && !!id,
    })),
  });

  const renterListingsMap = Object.fromEntries(
    renterListingQueries
      .filter(q => !!q.data)
      .map(q => [q.data!.id, q.data!]),
  );

  // ── Владелец: мои листинги → бронирования каждого ─────────────────────────
  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => rentService.getMyListings({ page: 1, page_size: 100 }),
    enabled: role === 'owner',
  });

  const listingsForQueries = (myListings?.items ?? []).filter(l => !!l.id);

  const listingBookingQueries = useQueries({
    queries: listingsForQueries.map(listing => ({
      queryKey: ['listing-bookings', String(listing.id), statusParam],
      queryFn: () => bookingService.getListingBookings({ listingId: String(listing.id), status: statusParam }),
      enabled: role === 'owner',
    })),
  });

  const ownerBookings: (BookingItem & { listingTitle: string; listingImage?: string })[] =
    listingsForQueries.flatMap((listing, i) => {
      const q = listingBookingQueries[i];
      return (q?.data?.items ?? []).map(b => ({
        ...b,
        listingTitle: listing.title,
        listingImage: listing.previewImage,
      }));
    });

  const ownerLoading = listingsLoading || listingBookingQueries.some(q => q.isLoading);

  // ── Мутации ──────────────────────────────────────────────────────────────
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    listingsForQueries.forEach(l =>
      queryClient.invalidateQueries({ queryKey: ['listing-bookings', String(l.id)] }),
    );
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
  const bookings =
    role === 'renter'
      ? (renterData?.items ?? []).map(b => ({
          ...b,
          listingTitle: renterListingsMap[b.listing_id]?.title ?? b.listing_id,
          listingImage: renterListingsMap[b.listing_id]?.previewImage?.url,
        }))
      : ownerBookings;

  return (
    <div style={{ padding: '40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <SegmentedControl
          value={role}
          onChange={v => {
            setRole(v as Role);
            setStatusFilter('all');
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
          <Center py={60}>
            <Loader color="#FF8104" />
          </Center>
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

              return (
                <BookingCard
                  key={booking.booking_id}
                  booking={booking}
                  role={role}
                  listingTitle={booking.listingTitle}
                  listingImage={booking.listingImage}
                  userIdToShow={
                    role === 'renter'
                      ? renterListingsMap[booking.listing_id]?.ownerId
                      : booking.renter_id
                  }
                  hasReview={hasReview}
                  isLoading={pendingBookingId === booking.booking_id}
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
            ['my-bookings'],
            ...listingsForQueries.map(l => ['listing-bookings', String(l.id)]),
          ]}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
