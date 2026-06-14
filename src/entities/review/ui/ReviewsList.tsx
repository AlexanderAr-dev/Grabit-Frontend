import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  Rating,
  Stack,
  Text,
} from '@mantine/core';

import { UserMiniCard } from '@entities/user/ui/UserMiniCard';
import { IReview } from '@shared/types';

interface ReviewsListProps {
  reviews: IReview[];
  onShowAll?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const ReviewCard = ({ review }: { review: IReview }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = review.text.length > 180;

  return (
    <Card
      padding="xl"
      radius="lg"
      withBorder
      shadow="sm"
      style={{ borderColor: '#ececec', transition: 'all 0.2s ease' }}
    >
      <Flex justify="space-between" align="flex-start">
        <Box style={{ flex: 1 }}>
          <UserMiniCard userId={review.authorId} ratingType="renter" />
        </Box>
        <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
          <Group gap={8}>
            <Text fw={600} size="sm">{review.rating.toFixed(1)}</Text>
            <Rating value={review.rating} fractions={2} readOnly size="sm" />
          </Group>
          <Text size="sm" c="dimmed">
            {new Date(review.createdDate).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>
      </Flex>

      {review.adName && (
        <Text size="xs" c="dimmed" mt={6} mb={2}>
          Объявление: {review.adName}
        </Text>
      )}

      <Text
        size="sm"
        c="dimmed"
        mt={6}
        style={{
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.text}
      </Text>

      {isLongText && (
        <Text
          mt={6}
          size="sm"
          fw={600}
          style={{ cursor: 'pointer', color: '#f08c00' }}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Скрыть' : 'Читать дальше'}
        </Text>
      )}
    </Card>
  );
};

export const ReviewsList = ({ reviews, onShowAll, hasMore = false, isLoading = false }: ReviewsListProps) => {
  return (
    <Box maw={900} mx="auto" mt={50}>
      <Text size="xl" fw={700} mb="xl">Отзывы</Text>
      <Stack gap="xl">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Stack>
      {hasMore && (
        <Flex justify="center" mt="xl">
          <Button
            radius="xl"
            size="md"
            variant="filled"
            style={{ backgroundColor: '#f08c00' }}
            loading={isLoading}
            onClick={onShowAll}
          >
            Показать больше отзывов
          </Button>
        </Flex>
      )}
    </Box>
  );
};
