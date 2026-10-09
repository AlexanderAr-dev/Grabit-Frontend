import { ReactNode, useState } from 'react';
import {
  Badge,
  Box,
  Button as MantineButton,
  Card,
  Flex,
  Group,
  Popover,
  Rating,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLogin, IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { chatService } from '@shared/api';
import { IRentalDetail } from '@shared/types';
import { Button, MissingField } from '@shared/ui';
import { UserMiniCard } from '@entities/user';
import { useAuth } from '@features/auth';
import { BookingWidget } from './BookingWidget';
import { MediaGallery } from './MediaGallery';

interface RentPageViewProps {
  listing: IRentalDetail;
  isOwner?: boolean;
  afterCard?: ReactNode;
}

export const RentPageInfo = ({ listing, isOwner, afterCard }: RentPageViewProps) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 576px)');
  const [chatLoading, setChatLoading] = useState(false);
  const [loginPopoverOpen, setLoginPopoverOpen] = useState(false);
  const { isAuthenticated, login } = useAuth();

  const handleWriteToOwner = async () => {
    if (!isAuthenticated) {
      setLoginPopoverOpen(true);
      return;
    }
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
        align="stretch"
        direction={isMobile ? 'column' : 'row'}
        style={{
          border: isMobile ? 'none' : '1px solid var(--mantine-color-default-border)',
          borderRadius: isMobile ? 0 : '10px',
          overflow: 'hidden',
          background: 'var(--mantine-color-default)',
        }}
      >
        <MediaGallery media={media} />

        <Card
          padding="lg"
          radius={0}
          style={{ maxWidth: isMobile ? '100%' : 400, fontFamily: 'sans-serif', flex: 1 }}
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

          {listing.quantity != null && listing.quantity > 1 && (
            <Box mb="md">
              <Text fw={600} size="sm" mb={4}>Количество</Text>
              <Text size="sm">{listing.quantity} шт.</Text>
            </Box>
          )}

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

          {!isOwner && (
            <Popover
              opened={loginPopoverOpen}
              onClose={() => setLoginPopoverOpen(false)}
              position="top"
              withArrow
              shadow="md"
              width={240}
            >
              <Popover.Target>
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
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="sm">
                  <Text size="sm">Войдите в аккаунт, чтобы написать продавцу</Text>
                  <MantineButton
                    fullWidth
                    size="sm"
                    color="orange"
                    radius="md"
                    leftSection={<IconLogin size={16} />}
                    onClick={() => { setLoginPopoverOpen(false); login(); }}
                  >
                    Войти
                  </MantineButton>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
        </Card>
      </Flex>

      {afterCard}

      <Flex justify="center" mt={20}>
        <Box style={{ width: '100%', maxWidth: 832 }}>
          <Flex gap="xl" mb={30} direction={isMobile ? 'column' : 'row'}>
            <Box style={{ flex: 1 }}>
              <Text size="xl" fw={600} mb={8}>Описание</Text>
              <Text size="sm" style={{ lineHeight: 1.6 }}>
                {listing.description || 'Нет описания'}
              </Text>
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="xl" fw={600} mb={8}>Характеристики</Text>
              {listing.category.name && (
                <Group gap={6} wrap="nowrap">
                  <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>Категория:</Text>
                  <Badge variant="light" color="orange" size="sm">
                    {listing.category.name}
                  </Badge>
                </Group>
              )}
            </Box>
          </Flex>

          {listing.attributes && listing.attributes.length > 0 && (
            <Box mb={30}>
              <Text size="xl" fw={600} mb={12}>Параметры</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
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

          {!isOwner && (
            <Box mb={30}>
              <BookingWidget
                listingId={listing.id}
                pricePerHour={listing.cost.payment}
                bufferHours={listing.bufferHours}
                availableFrom={listing.availableFrom}
                availableUntil={listing.availableUntil}
              />
            </Box>
          )}
        </Box>
      </Flex>
    </>
  );
};
