import { ReactNode, useState } from 'react';
import {
  Box,
  Card,
  Flex,
  Group,
  Rating,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { chatService } from '@shared/api';
import { IRentalDetail } from '@shared/types';
import { Button, MissingField } from '@shared/ui';
import { UserMiniCard } from '@entities/user';
import { BookingWidget } from './BookingWidget';
import { MediaGallery } from './MediaGallery';

interface RentPageViewProps {
  listing: IRentalDetail;
  afterCard?: ReactNode;
}

export const RentPageInfo = ({ listing, afterCard }: RentPageViewProps) => {
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(false);

  const handleWriteToOwner = async () => {
    setChatLoading(true);
    try {
      const conversation = await chatService.createOrGetConversation(listing.id);
      navigate(`/chats/${conversation.conversation_id}`, { state: { conversation } });
    } finally {
      setChatLoading(false);
    }
  };

  const media = listing.media && listing.media.length > 0
    ? listing.media
    : listing.previewImage
      ? [listing.previewImage]
      : [];

  return (
    <>
      <Flex
        align="center"
        direction="row"
        style={{ border: '1px solid gray', borderRadius: '10px', overflow: 'hidden' }}
      >
        <MediaGallery media={media} />

        <Card
          padding="lg"
          radius="md"
          style={{ maxWidth: 400, fontFamily: 'sans-serif', flex: 1 }}
          bdrs={0}
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

          <Box mb="md">
            <Text fw={600} size="md" mb={8}>Владелец</Text>
            {listing.ownerId ? (
              <UserMiniCard userId={listing.ownerId} ratingType="owner" />
            ) : (
              <MissingField />
            )}
          </Box>

          <Button
            fullWidth
            variant="primary"
            leftSection={<IconMessageCircle size={18} />}
            radius="md"
            loading={chatLoading}
            onClick={handleWriteToOwner}
          >
            Написать
          </Button>
        </Card>
      </Flex>

      {afterCard}

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
              {/* <Text size="sm">
                <Text span fw={600}>Категория: </Text>
                {listing.category.name ?? <MissingField />}
              </Text> */}
            </Box>
          </Flex>

          {listing.attributes && listing.attributes.length > 0 && (
            <Box mb={30}>
              <Text size="xl" fw={600} mb={12}>Параметры</Text>
              <SimpleGrid cols={2} spacing="xs">
                {listing.attributes.map((attr, i) => (
                  <Group key={i} gap={6} wrap="nowrap">
                    <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                      {attr.key}:
                    </Text>
                    <Text size="sm" c="dimmed">
                      {attr.value}
                    </Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Box>
          )}

          <Box mb={30}>
            <BookingWidget
              listingId={listing.id}
              pricePerHour={listing.cost.payment}
              maxQuantity={listing.quantity ?? 1}
            />
          </Box>
        </Box>
      </Flex>
    </>
  );
};
