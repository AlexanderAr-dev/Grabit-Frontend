import { useMemo, useState } from 'react';
import { Flex } from '@mantine/core';

import { mockRentItems } from '../model/mockRentItems';
import { RentalsCategories } from './RentalsCategories';
import { SearchInput } from './SearchInput';
import { RentCardList } from '@widgets/rental-card-list';

export const RentalsView = () => {
  const [searchValue, setSearchValue] = useState('');
  const [productType, setProductType] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let items = mockRentItems.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.address.toLowerCase().includes(searchValue.toLowerCase());
      const matchesType = productType ? item.productType === productType : true;
      return matchesSearch && matchesType;
    });

    if (sortValue) {
      switch (sortValue) {
        case 'date':
          items = [...items].sort(
            (a, b) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime(),
          );
          break;
        case 'price_asc':
          items = [...items].sort((a, b) => a.cost.payment - b.cost.payment);
          break;
        case 'price_desc':
          items = [...items].sort((a, b) => b.cost.payment - a.cost.payment);
          break;
        case 'popular':
          items = [...items].sort(
            (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
          );
          break;
      }
    }

    return items;
  }, [searchValue, productType, sortValue]);

  return (
    <>
      <Flex gap="md" justify="center" align="center" direction="column">
        <SearchInput
          value={searchValue}
          onChange={event => setSearchValue(event.currentTarget.value)}
        />
        <RentalsCategories
          activeFilter={productType}
          onFilterChange={setProductType}
          onSortChange={setSortValue}
        />
      </Flex>

      <div style={{ padding: 20, minHeight: '100vh' }}>
        <RentCardList items={filteredItems} />
      </div>
    </>
  );
};
