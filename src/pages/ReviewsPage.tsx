import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Rating,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconMapPin } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ReviewsList, ReviewsSlider } from '@entities/review';
import { UserMiniCard } from '@entities/user';
import { rentService, reviewsService } from '@shared/api';
import { ReviewSort } from '@shared/api/reviewsService';
import { IReview } from '@shared/types';

const SORT_OPTIONS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'old', label: 'Сначала старые' },
  { value: 'high', label: 'Высокий рейтинг' },
  { value: 'low', label: 'Низкий рейтинг' },
];

const UserHeaderCard = ({ userId }: { userId: string }) => (
  <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
    <UserMiniCard userId={userId} ratingType="owner" />
  </Card>
);

const ListingHeaderCard = ({ listingId }: { listingId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['rentInfo', listingId],
    queryFn: () => rentService.getRentInfo(listingId),
  });

  if (isLoading) return <Loader color="#FF8104" />;
  const listing = data?.data.data;
  if (!listing) return null;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
      <Group gap="lg" wrap="nowrap">
        <Image
          src={listing.previewImage?.url || '/placeholder.jpg'}
          width={80}
          height={80}
          radius="md"
          style={{ objectFit: 'cover', width: 80, height: 80, flexShrink: 0 }}
          fallbackSrc="/placeholder.jpg"
        />
        <Box style={{ flex: 1 }}>
          <Title order={3}>{listing.title}</Title>
          {listing.address && (
            <Text size="sm" c="dimmed" mb="xs">{listing.address}</Text>
          )}
          <Group gap="md">
            <Text size="sm" fw={600}>{listing.cost.payment} ₽/{listing.cost.priceUnit}</Text>
            <Group gap={6}>
              <Rating value={listing.rating ?? undefined} fractions={2} readOnly size="sm" />
              <Text size="sm" c="dimmed">({listing.reviewCount})</Text>
            </Group>
          </Group>
        </Box>
      </Group>
    </Card>
  );
};

const PAGE_SIZE = 20;

const ListingReviewsPage = ({ listingId }: { listingId: string }) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewSort>('new');
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [allReviews, setAllReviews] = useState<IReview[]>([]);
  const [total, setTotal] = useState(0);

  const ratingNumbers = ratingFilter.map(Number);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reviews', 'listing', listingId, page, sort, ratingFilter],
    queryFn: () =>
      reviewsService.getReviewsByRentalId(listingId, {
        page,
        pageSize: PAGE_SIZE,
        sort,
        rating: ratingNumbers.length ? ratingNumbers : undefined,
      }),
  });

  useEffect(() => {
    if (!data) return;
    setAllReviews(prev => page === 1 ? data.items : [...prev, ...data.items]);
    setTotal(data.total);
  }, [data, page]);

  const resetAndApply = (newSort: ReviewSort, newRating: string[]) => {
    setSort(newSort);
    setRatingFilter(newRating);
    setPage(1);
    setAllReviews([]);
  };

  const hasMore = allReviews.length < total;

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <Select
          data={SORT_OPTIONS}
          value={sort}
          onChange={v => resetAndApply((v as ReviewSort) ?? 'new', ratingFilter)}
          radius="lg"
          w={180}
        />
        <Chip.Group
          multiple
          value={ratingFilter}
          onChange={v => resetAndApply(sort, v)}
        >
          <Group gap={6}>
            {[5, 4, 3, 2, 1].map(r => (
              <Chip key={r} value={String(r)} radius="xl" size="sm" color="orange">
                {'★'.repeat(r)}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>

      {isLoading && page === 1 ? (
        <Flex justify="center" py="xl"><Loader color="#FF8104" /></Flex>
      ) : allReviews.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">Отзывов пока нет.</Text>
      ) : (
        <ReviewsList
          reviews={allReviews}
          hasMore={hasMore}
          isLoading={isFetching}
          onShowAll={() => setPage(prev => prev + 1)}
        />
      )}
    </Stack>
  );
};

const UserReviewsPage = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => rentService.getUserListings(userId),
  });

  const listings = listingsData?.items ?? [];

  if (isLoading) {
    return <Flex justify="center" py="xl"><Loader color="#FF8104" /></Flex>;
  }

  if (listings.length === 0) {
    return <Text c="dimmed" ta="center" py="xl">Отзывов пока нет.</Text>;
  }

  return (
    <Stack gap="xl">
      {listings.map(listing => (
        <Box key={listing.id}>
          <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            withBorder
            mb="sm"
            style={{ borderColor: '#e2e8f0', cursor: 'pointer' }}
            onClick={() => navigate(`/rent-page/${listing.id}`)}
          >
            <Flex gap="lg" align="center">
              <Image
                src={listing.previewImage?.url || '/placeholder.jpg'}
                fallbackSrc="/placeholder.jpg"
                width={100}
                height={75}
                radius="md"
                style={{ objectFit: 'cover', width: 100, height: 75, flexShrink: 0 }}
              />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text fw={700} size="md" lineClamp={2} style={{ flex: 1 }}>{listing.title}</Text>
                  <IconChevronRight size={18} color="#aaa" style={{ flexShrink: 0 }} />
                </Group>
                <Group gap={4} mt={4} mb={6}>
                  <Rating value={listing.rating || 0} fractions={2} readOnly size="xs" color="orange" />
                  <Text size="xs" c="dimmed">({listing.reviewCount ?? 0})</Text>
                </Group>
                <Group gap="xl">
                  <Text fw={600} size="sm" c="#FF8104">
                    {listing.cost.payment} ₽/{listing.cost.priceUnit}
                  </Text>
                  {listing.address && (
                    <Group gap={4}>
                      <IconMapPin size={13} color="#aaa" />
                      <Text size="xs" c="dimmed" lineClamp={1}>{listing.address}</Text>
                    </Group>
                  )}
                </Group>
              </Box>
            </Flex>
          </Card>
          <ReviewsSlider listingId={listing.id} excludeAuthorId={userId} />
        </Box>
      ))}
    </Stack>
  );
};

export const ReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type');
  const type: 'user' | 'listing' | null = rawType === 'user' || rawType === 'listing' ? rawType : null;
  const id = searchParams.get('id');

  if (!type || !id) {
    return (
      <Container size="sm" py="xl">
        <Text c="dimmed" ta="center">Не указан тип или идентификатор для отображения отзывов.</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      {type === 'user' ? (
        <>
          <UserHeaderCard userId={id} />
          <UserReviewsPage userId={id} />
        </>
      ) : (
        <>
          <ListingHeaderCard listingId={id} />
          <ListingReviewsPage listingId={id} />
        </>
      )}
    </Container>
  );
};
