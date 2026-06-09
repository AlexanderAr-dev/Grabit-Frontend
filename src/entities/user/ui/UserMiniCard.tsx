import { FC } from 'react';
import { Avatar, Group, Rating, Skeleton, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { UserService } from '@shared/api/userService';
import { ProBadge } from '@shared/ui';

interface UserMiniCardProps {
  userId: string;
  ratingType?: 'owner' | 'renter';
}

export const UserMiniCard: FC<UserMiniCardProps> = ({ userId, ratingType = 'owner' }) => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Group gap="sm">
        <Skeleton circle height={40} />
        <Stack gap={4}>
          <Skeleton height={14} width={100} />
          <Skeleton height={12} width={70} />
        </Stack>
      </Group>
    );
  }

  if (!profile) return null;

  const rating = ratingType === 'owner' ? profile.ratingAsOwner : profile.ratingAsRenter;
  const reviewCount = ratingType === 'owner' ? profile.reviewCountAsOwner : profile.reviewCountAsRenter;
  const displayName = profile.name || profile.username;

  return (
    <Group
      gap="sm"
      style={{ cursor: 'pointer' }}
      onClick={e => {
        e.stopPropagation();
        navigate(`/users/${userId}`);
      }}
    >
      <Avatar
        src={profile.avatarUrl}
        radius="xl"
        size={40}
        style={{ flexShrink: 0 }}
      />
      <Stack gap={2}>
        <Group gap={4} align="center" wrap="nowrap">
          <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>
            {displayName}
          </Text>
          {profile.isPremium && <ProBadge size="sm" />}
        </Group>
        <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
          @{profile.username}
        </Text>
        {rating > 0 && (
          <Group gap={4} align="center">
            <Rating value={rating} readOnly size="xs" fractions={2} />
            <Text size="xs" c="dimmed">
              {rating.toFixed(1)} ({reviewCount})
            </Text>
          </Group>
        )}
      </Stack>
    </Group>
  );
};
