import { FC } from 'react';
import {
  Card,
  Flex,
  Group,
  Image,
  Rating,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

import { componentsTheme } from '@shared/config';
import { CardDetails } from '@shared/types';
import { ProBadge } from '@shared/ui';

interface CardProps extends CardDetails {
  variant?: 'primary';
}

export const LargeCard: FC<CardProps> = ({
  variant = 'primary',
  title,
  price,
  priceUnit,
  location,
  rating,
  reviewCount,
  previewImage,
  shortDescription,
  createdAt,
  ownerIsPremium,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles = componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles[variant];

  return (
    <Card
      shadow="md"
      radius="lg"
      withBorder={false}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.text,
        overflow: 'hidden',
        border: `1px solid ${colorScheme === 'dark' ? '#1E293B' : '#E2E8F0'}`,
      }}
    >
      <Flex direction="row" gap="md">
        <Image
          src={previewImage}
          radius="md"
          alt={title}
          h={200}
          w="auto"
          fit="contain"
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Group
            justify="space-between"
            align="flex-start"
            mb={8}
            wrap="nowrap"
          >
            <Group gap={6} align="center" wrap="nowrap" style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
              <Text size="lg" fw={600} lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
                {title}
              </Text>
              {ownerIsPremium && <ProBadge size="sm" />}
            </Group>
            <Group gap={4} wrap="nowrap">
              <Rating value={rating} readOnly size="sm" />
              {reviewCount && (
                <Text
                  size="sm"
                  c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
                >
                  ({reviewCount})
                </Text>
              )}
            </Group>
          </Group>

          {shortDescription && (
            <Text
              size="sm"
              c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
              lineClamp={2}
              mb={12}
            >
              {shortDescription}
            </Text>
          )}

          <Text fw={700} size="xl" mb={4} c={variantStyles.text}>
            {price} руб
          </Text>
          <Text
            size="sm"
            c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
            mb={8}
          >
            за {priceUnit}
          </Text>

          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}>
              {location}
            </Text>
            <Text size="sm" c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}>
              {createdAt}
            </Text>
          </Group>
        </div>
      </Flex>
    </Card>
  );
};
