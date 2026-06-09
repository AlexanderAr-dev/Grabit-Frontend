import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  Loader,
  Rating,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBan, IconChevronRight, IconMapPin, IconPackage, IconStar } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ReviewsSlider } from '@entities/review';
import { UserMiniCard } from '@entities/user/ui/UserMiniCard';
import { chatService, rentService, reviewsService, UserService } from '@shared/api';
import { IRentalItem, IReview } from '@shared/types';
import { Button, ProBadge } from '@shared/ui';

const FIRST_PAGE_SIZE = 20;
const MORE_PAGE_SIZE = 5;

interface PublicProfileProps {
  userId: string;
}

const ReviewCard = ({ review }: { review: IReview }) => (
  <Card padding="lg" radius="lg" withBorder shadow="sm" style={{ borderColor: '#ececec' }}>
    <Flex justify="space-between" align="flex-start" gap="md">
      <Box style={{ flex: 1 }}>
        <UserMiniCard userId={review.authorId} ratingType="renter" />
      </Box>
      <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
        <Group gap={6}>
          <Text fw={600} size="sm">{review.rating.toFixed(1)}</Text>
          <Rating value={review.rating} fractions={2} readOnly size="xs" color="orange" />
        </Group>
        <Text size="xs" c="dimmed">
          {new Date(review.createdDate).toLocaleDateString('ru-RU')}
        </Text>
      </Stack>
    </Flex>
    <Text size="sm" c="dimmed" mt="sm" style={{ lineHeight: 1.6 }}>
      {review.text}
    </Text>
  </Card>
);

const ListingRow = ({ listing }: { listing: IRentalItem }) => {
  const navigate = useNavigate();

  return (
    <Box mb="xl">
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        withBorder
        style={{ borderColor: '#e2e8f0', cursor: 'pointer' }}
        onClick={() => navigate(`/rent-page/${listing.id}`)}
      >
        <Flex gap="lg" align="center">
          <Image
            src={listing.previewImage?.url || '/placeholder.jpg'}
            fallbackSrc="/placeholder.jpg"
            width={120}
            height={90}
            radius="md"
            style={{ objectFit: 'cover', width: 120, height: 90, flexShrink: 0 }}
          />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={700} size="md" lineClamp={2} style={{ flex: 1 }}>
                {listing.title}
              </Text>
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

      <Box mt="sm" px={4}>
        <Text size="sm" fw={600} c="dimmed" mb="sm">Отзывы об объявлении</Text>
        <ReviewsSlider listingId={listing.id} />
      </Box>
    </Box>
  );
};

export const PublicProfile = ({ userId }: PublicProfileProps) => {
  const [allReviews, setAllReviews] = useState<IReview[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(FIRST_PAGE_SIZE);
  const queryClient = useQueryClient();

  const { data: blockedUsers } = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: () => chatService.getBlockedUsers(),
  });
  const isBlockedByMe = blockedUsers?.includes(userId) ?? false;

  const unblockMutation = useMutation({
    mutationFn: () => chatService.unblockUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blockedUsers'] }),
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
  });

  const { data: reviewsData, isFetching: reviewsFetching } = useQuery({
    queryKey: ['userReviews', userId, pageSize],
    queryFn: () => reviewsService.getReviewsByUserId(userId, 1, pageSize),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!reviewsData) return;
    setAllReviews(reviewsData.items);
    setTotal(reviewsData.total);
  }, [reviewsData]);

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => rentService.getUserListings(userId),
    enabled: !!userId,
  });

  const listings = listingsData?.items ?? [];
  const hasMoreReviews = allReviews.length < total;

  if (profileLoading) {
    return (
      <Container size="md" py="xl">
        <Flex justify="center"><Loader color="#FF8104" /></Flex>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="md" py="xl">
        <Text c="dimmed" ta="center">Пользователь не найден.</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      {isBlockedByMe && (
        <Alert
          icon={<IconBan size={16} />}
          color="red"
          variant="light"
          mb="md"
          title="Пользователь заблокирован"
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm">Вы заблокировали этого пользователя. Он не может писать вам в чат.</Text>
            <Button
              variant="secondary"
              onClick={() => unblockMutation.mutate()}
              isLoading={unblockMutation.isPending}
            >
              Разблокировать
            </Button>
          </Group>
        </Alert>
      )}

      {/* Шапка профиля */}
      <Card shadow="sm" padding="lg" radius="lg" withBorder mb="xl" style={{ borderColor: '#e2e8f0' }}>
        <Flex justify="space-between" align="flex-start" gap="md">
          <Box style={{ flex: 1 }}>
            <Group gap={8} align="center" wrap="nowrap" mb={4}>
              <Title order={2} style={{ margin: 0 }}>{profile.name || profile.username}</Title>
              {profile.isPremium && <ProBadge size="md" />}
            </Group>
            <Text c="dimmed" size="sm" mb="md">@{profile.username}</Text>
            <Text size="xs" c="dimmed">
              На сервисе с{' '}
              {new Date(profile.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </Text>
          </Box>
          <Avatar
            src={profile.avatarUrl || '/placeholder.jpg'}
            size={90}
            radius="md"
            alt={profile.name}
          />
        </Flex>

        <Flex gap="md" mt="lg" wrap="wrap">
          <Card padding="sm" radius="md" withBorder style={{ flex: 1, minWidth: 130 }}>
            <Group gap={8}>
              <IconStar size={18} color="#FF8104" />
              <Box>
                <Text fw={700} size="lg" lh={1}>{profile.ratingAsOwner.toFixed(1)}</Text>
                <Text size="xs" c="dimmed">арендодатель ({profile.reviewCountAsOwner})</Text>
              </Box>
            </Group>
          </Card>
          <Card padding="sm" radius="md" withBorder style={{ flex: 1, minWidth: 130 }}>
            <Group gap={8}>
              <IconStar size={18} color="#FF8104" />
              <Box>
                <Text fw={700} size="lg" lh={1}>{profile.ratingAsRenter.toFixed(1)}</Text>
                <Text size="xs" c="dimmed">арендатор ({profile.reviewCountAsRenter})</Text>
              </Box>
            </Group>
          </Card>
          <Card padding="sm" radius="md" withBorder style={{ flex: 1, minWidth: 130 }}>
            <Group gap={8}>
              <IconPackage size={18} color="#FF8104" />
              <Box>
                <Text fw={700} size="lg" lh={1}>{profile.activeListingsCount}</Text>
                <Text size="xs" c="dimmed">объявлений</Text>
              </Box>
            </Group>
          </Card>
        </Flex>
      </Card>

      {/* Отзывы о продавце */}
      <Title order={3} mb="lg">Отзывы о продавце</Title>

      {allReviews.length === 0 && !reviewsFetching ? (
        <Text c="dimmed" mb="xl">Отзывов о продавце пока нет.</Text>
      ) : (
        <Stack gap="md" mb="lg">
          {allReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </Stack>
      )}

      {hasMoreReviews && (
        <Flex justify="center" mb="xl">
          <Button
            variant="primary"
            radius="xl"
            loading={reviewsFetching}
            onClick={() => setPageSize(prev => prev + MORE_PAGE_SIZE)}
          >
            Показать ещё отзывы
          </Button>
        </Flex>
      )}

      <Divider my="xl" />

      {/* Объявления продавца */}
      <Title order={3} mb="lg">Объявления продавца</Title>

      {listingsLoading ? (
        <Flex justify="center" py="xl"><Loader color="#FF8104" /></Flex>
      ) : listings.length === 0 ? (
        <Text c="dimmed" ta="center">У пользователя нет активных объявлений.</Text>
      ) : (
        listings.map(listing => (
          <ListingRow key={listing.id} listing={listing} />
        ))
      )}
    </Container>
  );
};
