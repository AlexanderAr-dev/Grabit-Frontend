import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Box, Container, Flex, SimpleGrid, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

import { CardPreview } from '@shared/types';
import { Button } from '@shared/ui';
import { MediumCard } from '@entities/rental';
import { SearchInput } from '@features/search-rentals';

const mockCards: CardPreview[] = [
  {
    id: '1',
    title: 'Ремонт квартир под ключ',
    price: 134,
    priceUnit: 'день',
    location: 'Р-н Советский',
    rating: 4.5,
    reviewCount: 12,
    shortDescription: 'Ремонт под ключ с гарантией качества: быстро, аккуратно и по доступной цене.',
    createdAt: '20 дек 2025',
    category: { id: 1, name: 'services' },
    previewImage: 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
  },
  {
    id: '4',
    title: 'Аренда перфоратора Bosch',
    price: 800,
    priceUnit: 'день',
    location: 'Р-н Октябрьский',
    rating: 4.8,
    reviewCount: 34,
    shortDescription: 'Мощный перфоратор Bosch GBH 2-26 DRE. Идеален для сверления бетона, кирпича, камня.',
    createdAt: '10 фев 2026',
    category: { id: 4, name: 'tools' },
    previewImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
  },
];

export const HostedRentalsPage: FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = mockCards.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size="xl" py="xl">
      <Flex gap="md" justify="center" align="center" direction="row" pb={20}>
        <SearchInput
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
        />
        <Button radius="lg" w={180} h={40} onClick={() => navigate('/create-listing')}>
          Новое объявление
        </Button>
      </Flex>

      <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
        {filtered.map(card => (
          <Box key={card.id} style={{ position: 'relative' }}>
            <MediumCard variant="primary" {...card} />
            <ActionIcon
              size={40}
              radius="md"
              variant="filled"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#FF8104',
                zIndex: 1,
              }}
              onClick={() => navigate(`/edit-listing/${card.id}`)}
              title="Редактировать"
            >
              <IconEdit size={20} color="#fff" />
            </ActionIcon>
            <Box
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 1,
              }}
            >
              <Button
                variant="secondary"
                radius="md"
                style={{ height: 32, fontSize: 13, padding: '0 12px' }}
                onClick={() => navigate(`/edit-listing/${card.id}`)}
              >
                <Text size="xs">Редактировать</Text>
              </Button>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {filtered.length === 0 && (
        <Flex justify="center" mt={40}>
          <Text c="dimmed">Объявления не найдены</Text>
        </Flex>
      )}
    </Container>
  );
};
