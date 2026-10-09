import { useState } from 'react';
import { Box, Button, Flex, Text, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { IconAdjustments, IconList, IconMap } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { useCity } from '@shared/lib/cityContext';
import { RentCardList } from '@widgets/rental-card-list';
import { FilterDrawer } from './FilterDrawer';
import { MapSearchView } from './MapSearchView';
import { RentalsCategories } from './RentalsCategories';
import { SearchInput } from './SearchInput';

type ViewMode = 'list' | 'map';
type SortValue = 'new' | 'old' | 'cheap' | 'expensive' | 'popular' | 'highRating' | 'lowRating';

export const RentalsView = () => {
  const isMobile = useMediaQuery('(max-width: 576px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const [mode, setMode] = useState<ViewMode>(() => {
    const saved = sessionStorage.getItem('rentals_view_mode');
    return saved === 'map' ? 'map' : 'list';
  });
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortValue, setSortValue] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [debouncedMin] = useDebouncedValue(minPrice, 600);
  const [debouncedMax] = useDebouncedValue(maxPrice, 600);
  const { city } = useCity();

  const handleReset = () => {
    setCategoryId(null);
    setSortValue(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  const hasActiveFilters =
    categoryId != null || sortValue != null || minPrice != null || maxPrice != null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', searchValue, categoryId, debouncedMin, debouncedMax, sortValue, city.key],
    queryFn: () =>
      rentService.getRentList({
        query: searchValue || undefined,
        category_id: categoryId ?? undefined,
        min_price: debouncedMin,
        max_price: debouncedMax,
        sort: (sortValue as SortValue) ?? undefined,
        lat: city.lat,
        lon: city.lon,
        radius_km: city.radius_km,
        page: 1,
        page_size: 50,
      }),
    enabled: mode === 'list',
  });

  return (
    <>
      <Flex gap="md" justify="center" align="center" direction="column">
        {/* Поисковая строка */}
        {isMobile ? (
          /* На мобильном: поиск на всю ширину + кнопка фильтров */
          <Flex gap={8} align="center" style={{ width: '100%' }}>
            <Box style={{ flex: 1 }}>
              <SearchInput
                value={inputValue}
                onChange={event => setInputValue(event.currentTarget.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') setSearchValue(inputValue);
                }}
                w="100%"
              />
            </Box>
            <Button
              onClick={openDrawer}
              radius="xl"
              variant={hasActiveFilters ? 'filled' : 'default'}
              color={hasActiveFilters ? 'orange' : undefined}
              px={14}
              style={{ flexShrink: 0, height: 46 }}
              leftSection={<IconAdjustments size={18} />}
            >
              {hasActiveFilters ? 'Фильтры •' : 'Фильтры'}
            </Button>
          </Flex>
        ) : (
          /* На десктопе: поиск + переключатель Список/Карта */
          <Flex gap={12} align="center" style={{ width: '100%', maxWidth: 640 }}>
            <SearchInput
              value={inputValue}
              onChange={event => setInputValue(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') setSearchValue(inputValue);
              }}
            />
            <Flex
              style={{
                flexShrink: 0,
                border: `1.5px solid ${isDark ? '#334155' : '#e9ecef'}`,
                borderRadius: 10,
                overflow: 'hidden',
                background: isDark ? '#1E293B' : '#f8f9fa',
              }}
            >
              {(['list', 'map'] as ViewMode[]).map((m, i) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); sessionStorage.setItem('rentals_view_mode', m); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: mode === m ? '#fff' : isDark ? '#94A3B8' : '#495057',
                    background: mode === m ? '#FF8104' : 'transparent',
                    borderRight: i === 0 ? `1.5px solid ${isDark ? '#334155' : '#e9ecef'}` : undefined,
                    border: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  {m === 'list' ? <IconList size={15} /> : <IconMap size={15} />}
                  {m === 'list' ? 'Список' : 'На карте'}
                </button>
              ))}
            </Flex>
          </Flex>
        )}

        {/* Фильтры — только на десктопе */}
        {!isMobile && (
          <RentalsCategories
            onSortChange={setSortValue}
            sortValue={sortValue}
            selectedCategoryId={categoryId}
            onCategorySelect={setCategoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        )}
      </Flex>

      {/* Дровер с фильтрами для мобильного */}
      <FilterDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        mode={mode}
        onModeChange={m => { setMode(m); closeDrawer(); }}
        sortValue={sortValue}
        onSortChange={setSortValue}
        selectedCategoryId={categoryId}
        onCategorySelect={setCategoryId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={handleReset}
      />

      <div style={{ padding: isMobile ? '16px 0' : 20, minHeight: '100vh' }}>
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
            {!isError && <RentCardList items={data?.items ?? []} isLoading={isLoading} />}
          </>
        )}
      </div>
    </>
  );
};
