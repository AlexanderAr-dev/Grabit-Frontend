import { useState } from 'react';
import { IReview } from '@app-types/IReview';
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Rating,
  Stack,
  Text,
} from '@mantine/core';

interface ReviewsListProps {
  reviews: IReview[];
  onShowAll?: () => void;
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
      style={{
        borderColor: '#ececec',
        transition: 'all 0.2s ease',
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Group gap="md">
          <Avatar
            src={
              review.author.avatar?.url ||
              'https://via.placeholder.com/50'
            }
            size={56}
            radius="xl"
          />

          <Box>
            <Text fw={700} size="md">
              {review.author.name}
            </Text>

            <Group gap={8} mt={4}>
              <Text fw={600} size="sm">
                {review.rating.toFixed(1)}
              </Text>

              <Rating
                value={review.rating}
                fractions={2}
                readOnly
                size="sm"
              />
            </Group>
          </Box>
        </Group>

        <Text size="sm" c="dimmed">
          {new Date(review.createdDate).toLocaleDateString(
            'ru-RU',
          )}
        </Text>
      </Flex>

      {/* Title */}
      <Text fw={600} size="lg" mt="md">
        {review.adName}
      </Text>

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
          style={{
            cursor: 'pointer',
            color: '#f08c00',
          }}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Скрыть' : 'Читать дальше'}
        </Text>
      )}
    </Card>
  );
};

export const ReviewsList = ({
  reviews,
  onShowAll,
}: ReviewsListProps) => {
  return (
    <Box maw={900} mx="auto" mt={50}>
      <Text size="xl" fw={700} mb="xl">
        Отзывы
      </Text>

      <Stack gap="xl">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Stack>

      <Flex justify="center" mt="xl">
        <Button
          radius="xl"
          size="md"
          variant="filled"
          style={{
            backgroundColor: '#f08c00',
          }}
          onClick={onShowAll}
        >
          Показать больше отзывов
        </Button>
      </Flex>
    </Box>
  );
};
