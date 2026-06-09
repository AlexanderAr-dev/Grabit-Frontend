import { useState } from 'react';
import { Box, Flex, Group, Modal, Paper, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { rentService, reviewsService } from '@shared/api';
import { IRentalDetail } from '@shared/types';
import { MapAddressShow } from '@entities/map';
import { RentPageInfo, RentPageSkeleton, useGetRentInfoById } from '@entities/rental';
import { ReviewsList } from '@entities/review';
import { useAuth } from '@features/auth';
import { Button } from '@shared/ui';

export const RentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: listing, isLoading, isError } = useGetRentInfoById(id ?? '');

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsService.getReviewsByRentalId(id ?? ''),
    enabled: !!id,
  });
  const reviews = reviewsData?.items ?? [];

  const isOwner = !!user && !!listing && user.id === listing.ownerId;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const setStatusOptimistic = (status: string) => {
    queryClient.setQueryData(['rentAd', id], (old: IRentalDetail | undefined) =>
      old ? { ...old, status } : old,
    );
  };

  const { mutate: pause, isPending: isPausing } = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('Missing id'));
      return rentService.pauseListing(id);
    },
    onSuccess: () => {
      setStatusOptimistic('paused');
      queryClient.invalidateQueries({ queryKey: ['rentAd', id] });
    },
  });

  const { mutate: resume, isPending: isResuming } = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('Missing id'));
      return rentService.resumeListing(id);
    },
    onSuccess: () => {
      setStatusOptimistic('active');
      queryClient.invalidateQueries({ queryKey: ['rentAd', id] });
    },
  });

  const { mutate: deleteListing, isPending: isDeleting } = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('Missing id'));
      return rentService.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate('/my-products');
    },
  });

  if (isLoading) {
    return <RentPageSkeleton />;
  }

  if (isError || !listing) {
    return (
      <Flex justify="center" mt={60}>
        <Text c="dimmed">Объявление не найдено или сервер недоступен.</Text>
      </Flex>
    );
  }

  const status = listing.status;

  return (
    <>
      <RentPageInfo
        listing={listing}
        isOwner={isOwner}
        afterCard={isOwner ? (
          <>
            <Flex justify="center" mt={20} mb={4}>
              <Paper withBorder p="md" style={{ width: 832, borderRadius: 12 }}>
                <Text fw={600} size="md" mb={12}>Управление объявлением</Text>
                <Flex gap="md" align="center">
                  {status === 'active' && (
                    <Button
                      variant="secondary"
                      onClick={() => pause()}
                      isLoading={isPausing}
                      radius="md"
                    >
                      Приостановить
                    </Button>
                  )}
                  {status === 'paused' && (
                    <Button
                      variant="success"
                      onClick={() => resume()}
                      isLoading={isResuming}
                      radius="md"
                    >
                      Возобновить
                    </Button>
                  )}
                  <Button
                    variant="warning"
                    onClick={() => setDeleteModalOpen(true)}
                    radius="md"
                  >
                    Удалить
                  </Button>
                </Flex>
              </Paper>
            </Flex>

            <Modal
              opened={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              title="Удалить объявление?"
              centered
            >
              <Text size="sm" mb="lg">
                Это действие необратимо. Объявление будет удалено навсегда.
              </Text>
              <Flex gap="md" justify="flex-end">
                <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                  Отмена
                </Button>
                <Button
                  variant="warning"
                  onClick={() => deleteListing()}
                  isLoading={isDeleting}
                >
                  Удалить
                </Button>
              </Flex>
            </Modal>
          </>
        ) : undefined}
      />

      <Flex justify="center" mb={30}>
        <Box style={{ width: 832 }}>
          <Text size="xl" fw={600} mb={8}>Расположение</Text>
          {listing.address && (
            <Group gap={6} mb={12}>
              <IconMapPin size={16} style={{ color: '#888', flexShrink: 0 }} />
              <Text size="sm" c="dimmed">{listing.address}</Text>
            </Group>
          )}
          <MapAddressShow coordinates={listing.coordinates ?? '56.0153,92.8932'} />
        </Box>
      </Flex>
      {reviews.length > 0 && <ReviewsList reviews={reviews} />}
    </>
  );
};
