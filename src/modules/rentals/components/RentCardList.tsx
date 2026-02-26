import { IRentalItem } from '@app-types';
import { SmallCard } from '@components/cards/SmallCard.tsx';
import { SimpleGrid } from '@mantine/core';

interface RentCardListProps {
  items: IRentalItem[];
}

export function RentCardList({ items }: RentCardListProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3 }}
      spacing="lg"
    >
      {items.map((item, i) => (
        <SmallCard key={i} {...item} />
      ))}
    </SimpleGrid>
  );
}
