import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Flex,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Text,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { Button } from '@shared/ui';
import { MediumCard } from '@entities/rental';
import { SearchInput } from '@features/search-rentals';

const STATUS_OPTIONS = [
  { value: '',       label: 'Все'            },
  { value: 'active', label: 'Активные'       },
  { value: 'paused', label: 'Приостановлены' },
];

export const HostedRentalsPage: FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings', statusFilter],
    queryFn: () => rentService.getMyListings(statusFilter ? { status: statusFilter } : undefined),
  });

  const filtered = (data?.items ?? []).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size="xl" py="xl">
      <Flex gap="md" justify="center" align="center" direction="row" pb={16}>
        <SearchInput
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
        />
        <Button radius="lg" w={180} h={40} onClick={() => navigate('/create-listing')}>
          Новое объявление
        </Button>
      </Flex>

      <Flex justify="center" pb={20}>
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          data={STATUS_OPTIONS}
          radius="md"
        />
      </Flex>

      {isLoading && (
        <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} shadow="md" radius="lg" style={{ overflow: 'hidden' }}>
              <Flex direction="row" gap="md">
                <Skeleton height={230} width={230} radius="md" />
                <Flex direction="column" gap={8} style={{ flex: 1 }}>
                  <Skeleton height={22} width="70%" />
                  <Skeleton height={14} width="90%" />
                  <Skeleton height={14} width="80%" />
                  <Skeleton height={20} width="30%" mt={8} />
                  <Skeleton height={14} width="50%" />
                </Flex>
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
        {filtered.map(card => (
          <Box
            key={card.id}
            onClick={() => navigate(`/rent-page/${card.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <MediumCard
              variant="primary"
              {...card}
              actions={
                <Box onClick={(e) => { e.stopPropagation(); navigate(`/edit-listing/${card.id}`); }}>
                  <Button
                    variant="secondary"
                    radius="md"
                    style={{ height: 32, fontSize: 13, padding: '0 12px' }}
                  >
                    <Text size="xs">Редактировать</Text>
                  </Button>
                </Box>
              }
            />
          </Box>
        ))}
      </SimpleGrid>

      {!isLoading && filtered.length === 0 && (
        <Flex justify="center" mt={40}>
          <Text c="dimmed">Объявления не найдены</Text>
        </Flex>
      )}
    </Container>
  );
};
