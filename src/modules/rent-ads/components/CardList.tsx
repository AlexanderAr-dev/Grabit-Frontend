import { SmallCard } from '@components/cards/SmallCard.tsx';
import { SimpleGrid } from '@mantine/core';
import { mockData } from '@modules/rent-ads/constants/mockRentItems.ts';

export function CardList() {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3 }}
      spacing="lg"
    >
      {mockData.map((item, i) => (
        <SmallCard key={i} {...item} />
      ))}
    </SimpleGrid>
  );
}
