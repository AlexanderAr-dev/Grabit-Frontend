import { SimpleGrid } from '@mantine/core';

import { IRentalItem } from '@shared/types';
import { SmallCard, SmallCardSkeleton } from '@entities/rental';

interface RentCardListProps {
  items: IRentalItem[];
  isLoading?: boolean;
}

export function RentCardList({ items, isLoading }: RentCardListProps) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <SmallCardSkeleton key={i} />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {items.map(item => (
        <SmallCard key={item.id} {...item} />
      ))}
    </SimpleGrid>
  );
}
