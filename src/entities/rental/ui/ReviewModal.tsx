import { FC, useState } from 'react';
import { Alert, Button, Group, Modal, Rating, Stack, Text, Textarea } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewsService } from '@shared/api/reviewsService';

interface ReviewModalProps {
  opened: boolean;
  onClose: () => void;
  bookingId: string;
  reviewType: 'renter_to_listing' | 'owner_to_renter';
  queryKeysToInvalidate?: unknown[][];
  onSuccess?: (bookingId: string) => void;
}

export const ReviewModal: FC<ReviewModalProps> = ({
  opened,
  onClose,
  bookingId,
  reviewType,
  queryKeysToInvalidate = [],
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => reviewsService.createReview(bookingId, reviewType, rating, comment),
    onSuccess: () => {
      queryKeysToInvalidate.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      onSuccess?.(bookingId);
      onClose();
      setRating(0);
      setComment('');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = reviewType === 'renter_to_listing' ? 'Отзыв об объявлении' : 'Отзыв об арендаторе';

  return (
    <Modal opened={opened} onClose={handleClose} title={title} centered>
      <Stack gap="md">
        <div>
          <Text size="sm" mb={8}>
            Оценка
          </Text>
          <Rating value={rating} onChange={setRating} size="lg" />
        </div>

        <Textarea
          label="Комментарий"
          placeholder="Расскажите о вашем опыте..."
          value={comment}
          onChange={e => setComment(e.currentTarget.value)}
          minRows={3}
        />

        {error && (
          <Alert color="red" title="Ошибка">
            Не удалось отправить отзыв. Попробуйте ещё раз.
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose} disabled={isPending}>
            Отмена
          </Button>
          <Button onClick={() => mutate()} loading={isPending} disabled={rating === 0}>
            Отправить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
