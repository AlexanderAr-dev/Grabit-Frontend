import { FC } from 'react';
import { ICardPreview } from '@app-types';
import { componentsTheme } from '@constants';
import {
  Card,
  Flex,
  Group,
  Image,
  Rating,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

interface CardProps extends ICardPreview {
  variant?: 'primary';
}

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
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.cardTheme[colorScheme];
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

        {/* Контент справа */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Заголовок и рейтинг в одну строку */}
          <Group
            justify="space-between"
            align="flex-start"
            mb={8}
            wrap="nowrap"
          >
            <Text
              size="lg"
              fw={600}
              lineClamp={2}
              style={{
                flex: 1,
                minWidth: 0,
                marginRight: 8,
              }}
            >
              {title}
            </Text>
            <Group gap={4} wrap="nowrap">
              <Rating value={rating} readOnly size="sm" />
              {reviewCount && (
                <Text
                  size="sm"
                  c={
                    colorScheme === 'dark'
                      ? 'gray.4'
                      : 'gray.6'
                  }
                >
                  ({reviewCount})
                </Text>
              )}
            </Group>
          </Group>

          {/* Описание */}
          {shortDescription && (
            <Text
              size="sm"
              c={
                colorScheme === 'dark' ? 'gray.4' : 'gray.6'
              }
              lineClamp={2}
              mb={12}
            >
              {shortDescription}
            </Text>
          )}

          {/* Цена и единица измерения */}
          <Text
            fw={700}
            size="xl"
            mb={4}
            c={variantStyles.text}
          >
            {price} руб
          </Text>
          <Text
            size="sm"
            c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
            mb={8}
          >
            за {priceUnit}
          </Text>

          {/* Локация и дата в одну строку */}
          <Group
            justify="space-between"
            align="center"
            wrap="nowrap"
          >
            <Text
              size="sm"
              c={
                colorScheme === 'dark' ? 'gray.4' : 'gray.6'
              }
            >
              {location}
            </Text>
            <Text
              size="sm"
              c={
                colorScheme === 'dark' ? 'gray.4' : 'gray.6'
              }
            >
              {createdAt}
            </Text>
          </Group>
        </div>
      </Flex>
    </Card>
  );
};
