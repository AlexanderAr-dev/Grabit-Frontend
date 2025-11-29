import { FC } from 'react';
import { ICardPreview } from '@app-types';
import { componentsTheme } from '@constants';
import {
  Card,
  Group,
  Image,
  Rating,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

interface CardProps extends ICardPreview {
  variant?: 'primary';
}

export const SmallCard: FC<CardProps> = ({
  variant = 'primary',
  title,
  price,
  location,
  rating,
  previewImage,
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
        border: `2px solid ${colorScheme === 'dark' ? '#1E293B' : '#E2E8F0'}`,
      }}
    >
      <Card.Section>
        <Image
          src={previewImage}
          height={200}
          alt={title}
        />
      </Card.Section>

      <div style={{ padding: '14px 16px' }}>
        <Group
          justify="space-between"
          align="center"
          mb="xs"
        >
          <Rating value={rating} readOnly color="yellow" />
          <Text
            size="sm"
            c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
          >
            {createdAt}
          </Text>
        </Group>

        <Text
          size="xl"
          fw={600}
          mb={4}
          c={variantStyles.text}
        >
          {title}
        </Text>
        <Text
          fw={700}
          size="lg"
          mb={2}
          c={variantStyles.text}
        >
          {price}
        </Text>
        <Text
          size="sm"
          c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
        >
          {location}
        </Text>
      </div>
    </Card>
  );
};
