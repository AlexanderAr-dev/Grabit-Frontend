import { FC, ReactNode } from 'react';
import {
  Badge,
  Card,
  Flex,
  Group,
  Image,
  Rating,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

import { componentsTheme } from '@shared/config';
import { CardPreview } from '@shared/types';

interface CardProps extends CardPreview {
  variant?: 'primary';
  actions?: ReactNode;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:  { label: 'Активно',          color: 'green'  },
  paused:  { label: 'Приостановлено',   color: 'orange' },
  closed:  { label: 'Закрыто',          color: 'gray'   },
};

export const MediumCard: FC<CardProps> = ({
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
  status,
  actions,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles = componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles[variant];
  const dim = colorScheme === 'dark' ? 'gray.4' : 'gray.6';

  const statusCfg = status ? (STATUS_CONFIG[status] ?? { label: status, color: 'gray' }) : null;

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
          h={230}
          w={230}
          fit="cover"
          style={{ flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start" mb={8} wrap="nowrap">
            <Text
              size="lg"
              fw={600}
              lineClamp={2}
              style={{ flex: 1, minWidth: 0, marginRight: 8 }}
            >
              {title}
            </Text>

            <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
              <Text size="sm" c={dim} style={{ whiteSpace: 'nowrap' }}>
                {createdAt}
              </Text>
              {statusCfg && (
                <Badge size="md" color={statusCfg.color} variant="light" style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                  {statusCfg.label}
                </Badge>
              )}
            </Stack>
          </Group>

          {shortDescription && (
            <Text size="sm" c={dim} lineClamp={2} mb={12}>
              {shortDescription}
            </Text>
          )}

          <Text fw={700} size="xl" mb={4} c={variantStyles.text}>
            {price} руб
          </Text>
          <Text size="sm" c={dim} mb={8}>
            за {priceUnit}
          </Text>

          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" c={dim}>{location}</Text>
            <Group gap={4} wrap="nowrap">
              <Rating value={rating} readOnly size="sm" />
              {reviewCount && (
                <Text size="sm" c={dim}>({reviewCount})</Text>
              )}
            </Group>
          </Group>

          {actions && (
            <Flex justify="flex-end" mt={8}>
              {actions}
            </Flex>
          )}
        </div>
      </Flex>
    </Card>
  );
};
