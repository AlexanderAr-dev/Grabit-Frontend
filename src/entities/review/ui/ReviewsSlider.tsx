import { useRef } from 'react';
import { ActionIcon, Box, Card, Flex, Group, Loader, Rating, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { UserMiniCard } from '@entities/user/ui/UserMiniCard';
import { reviewsService } from '@shared/api';
import { IReview } from '@shared/types';

const SlideCard = ({ review }: { review: IReview }) => (
  <Card
    padding="md"
    radius="lg"
    withBorder
    shadow="sm"
    style={{
      minWidth: 280,
      maxWidth: 280,
      flexShrink: 0,
      borderColor: '#ececec',
      scrollSnapAlign: 'start',
    }}
  >
    <UserMiniCard userId={review.authorId} ratingType="renter" />
    <Group gap={6} mt="sm" mb={6}>
      <Rating value={review.rating} fractions={2} readOnly size="xs" color="orange" />
      <Text size="xs" fw={600}>{review.rating.toFixed(1)}</Text>
      <Text size="xs" c="dimmed" style={{ marginLeft: 'auto' }}>
        {new Date(review.createdDate).toLocaleDateString('ru-RU')}
      </Text>
    </Group>
    <Text size="sm" c="dimmed" lineClamp={3} style={{ lineHeight: 1.5 }}>
      {review.text}
    </Text>
  </Card>
);

interface ReviewsSliderProps {
  listingId: string;
}

export const ReviewsSlider = ({ listingId }: ReviewsSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'listing', listingId],
    queryFn: () => reviewsService.getReviewsByRentalId(listingId),
    staleTime: 5 * 60 * 1000,
  });

  const reviews = data?.items ?? [];

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 296 : -296, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Flex justify="center" py="md">
        <Loader color="#FF8104" size="sm" />
      </Flex>
    );
  }

  if (reviews.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="xs">Отзывов об этом объявлении пока нет.</Text>
    );
  }

  return (
    <Box style={{ position: 'relative', paddingInline: reviews.length > 1 ? 24 : 0 }}>
      {reviews.length > 1 && (
        <>
          <ActionIcon
            variant="filled"
            color="orange"
            radius="xl"
            size="md"
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
            onClick={() => scroll('left')}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="filled"
            color="orange"
            radius="xl"
            size="md"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
            onClick={() => scroll('right')}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </>
      )}
      <Box
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 4,
        }}
      >
        {reviews.map(review => (
          <SlideCard key={review.id} review={review} />
        ))}
      </Box>
    </Box>
  );
};
