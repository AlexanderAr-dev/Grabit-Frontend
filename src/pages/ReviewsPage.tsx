import {
  Box,
  Card,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Rating,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ReviewsList } from '@entities/review';
import { UserMiniCard } from '@entities/user';
import { rentService, reviewsService } from '@shared/api';
import { IReview } from '@shared/types';

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
              <Rating value={listing.rating} fractions={2} readOnly size="sm" />
              <Text size="sm" c="dimmed">({listing.reviewCount})</Text>
            </Group>
          </Group>
        </Box>
      </Group>
    </Card>
  );
};

const PAGE_SIZE = 20;

export const ReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type');
  const type: 'user' | 'listing' | null = rawType === 'user' || rawType === 'listing' ? rawType : null;
  const id = searchParams.get('id');

  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<IReview[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
    setAllReviews([]);
    setTotal(0);
  }, [type, id]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reviews', type, id, page],
    queryFn: () => {
      if (!id || !type) return Promise.resolve({ items: [], total: 0 });
      return type === 'user'
        ? reviewsService.getReviewsByUserId(id, page, PAGE_SIZE)
        : reviewsService.getReviewsByRentalId(id, page, PAGE_SIZE);
    },
    enabled: !!id && !!type,
  });

  useEffect(() => {
    if (!data) return;
    setAllReviews(prev => page === 1 ? data.items : [...prev, ...data.items]);
    setTotal(data.total);
  }, [data, page]);

  const hasMore = allReviews.length < total;

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
        <UserHeaderCard userId={id} />
      ) : (
        <ListingHeaderCard listingId={id} />
      )}

      {isLoading && page === 1 ? (
        <Flex justify="center" py="xl">
          <Loader color="#FF8104" />
        </Flex>
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
    </Container>
  );
};
