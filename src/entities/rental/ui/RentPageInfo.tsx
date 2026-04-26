import {
  Box,
  Card,
  Flex,
  Group,
  Image,
  Rating,
  Text,
} from '@mantine/core';
import { IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { IRentalDetail } from '@shared/types';
import { Button } from '@shared/ui';
import { BookingCalendar } from './BookingCalendar';

interface RentPageViewProps {
  listing: IRentalDetail;
}

export const RentPageInfo = ({ listing }: RentPageViewProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Flex
        mih={50}
        gap="xl"
        justify="center"
        align="center"
        direction="row"
        style={{ border: '1px solid gray', borderRadius: '10px' }}
      >
        <Image
          src={listing.previewImage?.url || 'https://via.placeholder.com/400'}
          h={405}
          w={400}
          bdrs={10}
          fallbackSrc="https://via.placeholder.com/400"
        />
        <Card
          padding="lg"
          radius="md"
          style={{ maxWidth: 400, fontFamily: 'sans-serif' }}
          bdrs={10}
        >
          <Text size="sm" c="dimmed" mb="md">
            {new Date(listing.createdDate).toLocaleDateString('ru-RU')}
          </Text>

          <Text fw={700} size="xl" mb="lg">
            {listing.title}
          </Text>

          <Group justify="space-between" mb="md">
            <Box>
              <Text fw={600} size="md" mb={4}>
                Цена
              </Text>
              <Text size="sm">
                {listing.cost.payment} руб. / {listing.cost.priceUnit}
              </Text>
            </Box>

            <Box style={{ textAlign: 'right' }}>
              <Text fw={600} size="md" mb={4}>
                Оценка
              </Text>
              <Group gap={4} justify="flex-end" mb={2}>
                <Rating
                  value={listing.rating || 0}
                  fractions={2}
                  readOnly
                  size="sm"
                />
                <Text size="sm" fw={500}>
                  {(listing.rating || 0).toFixed(1)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                ({listing.reviewCount || listing.reviews || 0} отзывов)
              </Text>
            </Box>
          </Group>

          <Box mb="lg">
            <Group gap={6} mb={4}>
              <IconMapPin size={16} style={{ color: 'gray' }} />
              <Text fw={600} size="md">
                Адрес
              </Text>
            </Group>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.3 }}>
              {listing.address}
            </Text>
          </Box>

          <Group justify="space-between" mb="md">
            <Flex direction="column">
              <Text fw={600} size="md">
                {listing.renter.name}
              </Text>
              <Group gap="lg">
                <Text size="sm" fw={500}>
                  {listing.renter.rating} ({listing.renter.reviewCount} отз.)
                </Text>
                <Group gap={2}>
                  {[...Array(5)].map((_, i) => (
                    <Text
                      key={i}
                      size="sm"
                      c={i < Math.floor(listing.renter.rating) ? '#ffd700' : 'gray'}
                    >
                      ★
                    </Text>
                  ))}
                </Group>
              </Group>
            </Flex>

            <Image
              w={50}
              h={50}
              src={listing.renter.avatar?.url || 'https://via.placeholder.com/50'}
              radius="xl"
              fallbackSrc="https://via.placeholder.com/50"
            />
          </Group>

          <Button
            fullWidth
            variant="primary"
            leftSection={<IconMessageCircle size={18} />}
            radius="md"
            onClick={() => navigate(`/chats/${listing.id}`)}
          >
            Написать
          </Button>
        </Card>
      </Flex>

      <Flex justify="center" mt={20}>
        <Box style={{ width: 832 }}>
          <Flex gap="xl" mb={30}>
            <Box w={400}>
              <Text size="xl" fw={600} mb={8}>Описание</Text>
              <Text size="sm" style={{ lineHeight: 1.6 }}>
                {listing.description || 'Нет описания'}
              </Text>
            </Box>
            <Box w={400}>
              <Text size="xl" fw={600} mb={8}>Характеристики</Text>
              <Text size="sm">
                <Text span fw={600}>Категория: </Text>
                {listing.category.name}
              </Text>
              <Text size="sm" mt={4}>
                <Text span fw={600}>Тип: </Text>
                {listing.productType === 'space'
                  ? 'Помещение'
                  : listing.productType === 'service'
                    ? 'Услуга'
                    : 'Товар'}
              </Text>
            </Box>
          </Flex>

          <Box mb={30}>
            <BookingCalendar booking={listing.booking} />
          </Box>
        </Box>
      </Flex>
    </>
  );
};
