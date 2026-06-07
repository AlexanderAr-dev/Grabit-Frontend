import { useMemo, useState } from 'react';
import { Flex, Text, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconList, IconMap } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { RentCardList } from '@widgets/rental-card-list';
import { MapSearchView } from './MapSearchView';
import { RentalsCategories } from './RentalsCategories';
import { SearchInput } from './SearchInput';

type ViewMode = 'list' | 'map';

export const RentalsView = () => {
  const [mode, setMode] = useState<ViewMode>('list');
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortValue, setSortValue] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [debouncedMin] = useDebouncedValue(minPrice, 600);
  const [debouncedMax] = useDebouncedValue(maxPrice, 600);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', searchValue, categoryId, debouncedMin, debouncedMax],
    queryFn: () =>
      rentService.getRentList({
        query: searchValue || undefined,
        category_id: categoryId ?? undefined,
        min_price: debouncedMin,
        max_price: debouncedMax,
        page: 1,
        page_size: 50,
      }),
    enabled: mode === 'list',
  });

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    let items = [...data.items];

    if (sortValue) {
      switch (sortValue) {
        case 'date':
          items.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
          break;
        case 'price_asc':
          items.sort((a, b) => a.cost.payment - b.cost.payment);
          break;
        case 'price_desc':
          items.sort((a, b) => b.cost.payment - a.cost.payment);
          break;
        case 'popular':
          items.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
          break;
      }
    }

    return items;
  }, [data, sortValue]);

  return (
    <>
      <Flex gap="md" justify="center" align="center" direction="column">
        <Flex gap={12} align="center" style={{ width: '100%', maxWidth: 640 }}>
          <SearchInput
            value={inputValue}
            onChange={event => setInputValue(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                setSearchValue(inputValue);
              }
            }}
          />
          {/* Переключатель режима */}
          <Flex
            style={{
              flexShrink: 0,
              border: '1.5px solid #e9ecef',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#f8f9fa',
            }}
          >
            {(['list', 'map'] as ViewMode[]).map((m, i) => (
              <UnstyledButton
                key={m}
                onClick={() => setMode(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: mode === m ? '#fff' : '#495057',
                  background: mode === m ? '#FF8104' : 'transparent',
                  borderRight: i === 0 ? '1.5px solid #e9ecef' : undefined,
                  transition: 'background 0.15s, color 0.15s',
                  cursor: 'pointer',
                }}
              >
                {m === 'list' ? <IconList size={15} /> : <IconMap size={15} />}
                {m === 'list' ? 'Список' : 'На карте'}
              </UnstyledButton>
            ))}
          </Flex>
        </Flex>
        <RentalsCategories
          onSortChange={setSortValue}
          selectedCategoryId={categoryId}
          onCategorySelect={setCategoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </Flex>

      <div style={{ padding: 20, minHeight: '100vh' }}>
        {mode === 'map' && (
          <MapSearchView
            filters={{ categoryId, minPrice: debouncedMin, maxPrice: debouncedMax }}
          />
        )}

        {mode === 'list' && (
          <>
            {isError && (
              <Flex justify="center" mt={40}>
                <Text c="dimmed">Не удалось загрузить объявления. Проверьте подключение к серверу.</Text>
              </Flex>
            )}
            {!isError && <RentCardList items={sortedItems} isLoading={isLoading} />}
          </>
        )}
      </div>
    </>
  );
};
