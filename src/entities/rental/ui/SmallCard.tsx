import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Group,
  Image,
  Rating,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

import { componentsTheme } from '@shared/config';
import { IRentalItem } from '@shared/types';
import { ProBadge } from '@shared/ui';

interface SmallCardProps extends IRentalItem {
  variant?: 'primary';
}

export const SmallCard: FC<SmallCardProps> = ({
  variant = 'primary',
  id,
  previewImage,
  title,
  rating,
  cost,
  address,
  createdDate,
  ownerIsPremium,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles = componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles[variant];
  const priceText = cost
    ? `${cost.payment} ₽/${cost.priceUnit}`
    : 'Цена не указана';
  const navigate = useNavigate();

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
      onClick={() => navigate(`/rent-page/${id}`)}
    >
      <Card.Section style={{ position: 'relative' }}>
        <Image
          src={previewImage?.url || '/placeholder.jpg'}
          fallbackSrc="/placeholder.jpg"
          height={200}
          alt={title}
        />
        {ownerIsPremium && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <ProBadge size="sm" />
          </div>
        )}
      </Card.Section>

      <div style={{ padding: '14px 16px' }}>
        <Group justify="space-between" align="center" mb="xs">
          <Rating value={rating || 0} readOnly color="yellow" />
          <Text
            size="sm"
            c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}
          >
            {new Date(createdDate).toLocaleDateString('ru-RU')}
          </Text>
        </Group>

        <Text size="xl" fw={600} mb={4} c={variantStyles.text}>
          {title}
        </Text>
        <Text fw={700} size="lg" mb={2} c={variantStyles.text}>
          {priceText}
        </Text>
        <Text size="sm" c={colorScheme === 'dark' ? 'gray.4' : 'gray.6'}>
          {address}
        </Text>
      </div>
    </Card>
  );
};
