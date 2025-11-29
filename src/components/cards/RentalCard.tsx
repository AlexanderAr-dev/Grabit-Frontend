import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  Badge,
  Card,
  Group,
  Image,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { Button } from '@ui';

interface RentalCardProps {
  variant?: 'primary';
  phone: string;
  service: string;
  status: 'current' | 'completed';
  timeLeft?: string;
  previewImage?: string;
  onClick: () => void;
}

export const RentalCard: FC<RentalCardProps> = ({
  variant = 'primary',
  phone,
  service,
  status,
  timeLeft,
  previewImage = 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200', // дефолтное изображение
  onClick,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles[variant];

  return (
    <Card
      shadow="sm"
      radius="lg"
      withBorder
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.text,
        border: `1px solid ${variantStyles.borderColor}`,
        marginBottom: '16px',
      }}
    >
      <Group
        justify="space-between"
        align="flex-start"
        gap="md"
      >
        {/* Картинка слева */}
        <Image
          src={previewImage}
          radius="md"
          alt={service}
          width={100}
          height={350}
          fit="cover"
          style={{
            minWidth: 80,
            flexShrink: 0,
          }}
        />

        {/* Контент по центру */}
        <div style={{ flex: 1 }}>
          <Text
            size="lg"
            fw={600}
            c={variantStyles.text}
            mb={4}
          >
            {phone}
          </Text>
          <Text
            size="md"
            c={variantStyles.secondaryText}
            mb={8}
          >
            {service}
          </Text>

          {status === 'current' && timeLeft ? (
            <Badge
              color="green"
              variant="light"
              size="lg"
              style={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(34, 197, 94, 0.1)',
                color:
                  colorScheme === 'dark'
                    ? '#4ADE80'
                    : '#16A34A',
              }}
            >
              До конца аренды: {timeLeft}
            </Badge>
          ) : (
            <Badge
              color="red"
              variant="light"
              size="lg"
              style={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(239, 68, 68, 0.1)',
                color:
                  colorScheme === 'dark'
                    ? '#F87171'
                    : '#DC2626',
              }}
            >
              Аренда закончена
            </Badge>
          )}
        </div>

        {/* Кнопка справа */}
        <Button
          onClick={onClick}
          size="md"
          style={{
            flexShrink: 0,
          }}
        >
          Написать
        </Button>
      </Group>
    </Card>
  );
};
