import { useCallback, useEffect, useState } from 'react';
import { Box, Flex, Image, Loader, Slider, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconMapPin } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { Link } from 'react-router-dom';

import { rentService } from '@shared/api';
import { IRentalItem } from '@shared/types';

const RADIUS_MARKS = [
  { value: 0, label: '1 км', km: 1 },
  { value: 25, label: '5 км', km: 5 },
  { value: 50, label: '10 км', km: 10 },
  { value: 75, label: '25 км', km: 25 },
  { value: 100, label: '50 км', km: 50 },
];

const DEFAULT_CENTER: [number, number] = [55.751574, 37.573856];

interface MapSearchFilters {
  categoryId?: number | null;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  filters: MapSearchFilters;
}

export const MapSearchView = ({ filters }: Props) => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(10);
  const [clickedPoint, setClickedPoint] = useState<[number, number] | null>(null);
  const [radiusSlider, setRadiusSlider] = useState(25);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const [debouncedPoint] = useDebouncedValue(clickedPoint, 300);

  const radiusKm = RADIUS_MARKS.find(m => m.value === radiusSlider)?.km ?? 5;

  useEffect(() => {
    if (!debouncedPoint) return;
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${debouncedPoint[0]}&lon=${debouncedPoint[1]}&format=json`,
      { signal: controller.signal, headers: { 'Accept-Language': 'ru' } },
    )
      .then(r => r.json())
      .then(res => setAddress(res.display_name ?? null))
      .catch(err => { if (err.name !== 'AbortError') setAddress(null); });
    return () => controller.abort();
  }, [debouncedPoint]);

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'map', debouncedPoint, radiusKm, filters.categoryId, filters.minPrice, filters.maxPrice],
    queryFn: () =>
      rentService.getRentList({
        lat: debouncedPoint![0],
        lon: debouncedPoint![1],
        radius_km: radiusKm,
        category_id: filters.categoryId ?? undefined,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        page: 1,
        page_size: 100,
      }),
    enabled: !!debouncedPoint,
  });

  const listings = data?.items ?? [];
  const withCoords = listings.filter((l): l is IRentalItem & { lat: number; lon: number } =>
    l.lat != null && l.lon != null
  );

  const selectedListing = selectedId ? listings.find(l => l.id === selectedId) ?? null : null;

  const handleMapClick = useCallback(({ latLng }: { latLng: [number, number] }) => {
    setClickedPoint(latLng);
    setSelectedId(null);
    setAddress(null);
  }, []);

  return (
    <Box>
      {/* Слайдер радиуса */}
      <Box
        px={20}
        py={14}
        mb={12}
        style={{
          background: '#f8f9fa',
          borderRadius: 16,
          border: '1px solid #e9ecef',
        }}
      >
        <Flex align="center" gap={20} wrap="nowrap">
          <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap', minWidth: 140 }}>
            Радиус поиска:{' '}
            <span style={{ color: '#FF8104', fontSize: 15 }}>{radiusKm} км</span>
          </Text>
          <Box style={{ flex: 1 }}>
            <Slider
              value={radiusSlider}
              onChange={setRadiusSlider}
              step={25}
              marks={RADIUS_MARKS}
              color="#FF8104"
              size="md"
              styles={{
                mark: { borderColor: '#dee2e6' },
                markLabel: { fontSize: 12, color: '#868e96', marginTop: 6 },
                thumb: { borderColor: '#FF8104', background: '#FF8104' },
              }}
            />
          </Box>
        </Flex>
      </Box>

      {/* Строка статуса */}
      <Flex align="center" gap={8} mb={10} px={2} style={{ minHeight: 22 }}>
        {clickedPoint && (
          <>
            <IconMapPin size={15} color="#FF8104" style={{ flexShrink: 0 }} />
            <Text size="sm" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
              {address ?? `${clickedPoint[0].toFixed(4)}, ${clickedPoint[1].toFixed(4)}`}
            </Text>
            {isLoading
              ? <Loader size={14} color="#FF8104" />
              : <Text size="sm" fw={500} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  — найдено: <span style={{ color: '#FF8104' }}>{listings.length}</span>
                </Text>
            }
          </>
        )}
      </Flex>

      {/* Карта */}
      <Box style={{ height: 680, borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid #e9ecef' }}>
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center: c, zoom: z }) => { setCenter(c); setZoom(z); }}
          onClick={handleMapClick}
        >
          {/* Маркер точки поиска */}
          {clickedPoint && (
            <Marker anchor={clickedPoint} width={42} color="#FF8104" />
          )}

          {/* Мини-карточки объявлений */}
          {withCoords.map(listing => {
            const isSelected = listing.id === selectedId;
            return (
              <Overlay key={listing.id} anchor={[listing.lat, listing.lon]}>
                <Box
                  onClick={e => { e.stopPropagation(); setSelectedId(isSelected ? null : listing.id); }}
                  style={{
                    transform: 'translate(-50%, -100%)',
                    marginBottom: 8,
                    cursor: 'pointer',
                    filter: isSelected ? 'drop-shadow(0 4px 12px rgba(255,129,4,0.5))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
                    transition: 'filter 0.15s',
                  }}
                >
                  <Box
                    style={{
                      background: '#fff',
                      borderRadius: 10,
                      overflow: 'hidden',
                      width: 150,
                      border: isSelected ? '2px solid #FF8104' : '2px solid #fff',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {listing.previewImage ? (
                      <img
                        src={listing.previewImage.url}
                        alt=""
                        style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box style={{ width: '100%', height: 80, background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconMapPin size={24} color="#adb5bd" />
                      </Box>
                    )}
                    <Box px={8} py={6}>
                      <Text size="xs" fw={600} lineClamp={1} style={{ color: '#1a1a2e' }}>
                        {listing.title}
                      </Text>
                      <Text size="xs" fw={700} style={{ color: '#FF8104', marginTop: 2 }}>
                        {listing.cost.payment} ₽/ч
                      </Text>
                    </Box>
                  </Box>
                  {/* Хвостик */}
                  <Box style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #fff', margin: '0 auto' }} />
                </Box>
              </Overlay>
            );
          })}

          {/* Большой попап при клике */}
          {selectedListing && selectedListing.lat != null && selectedListing.lon != null && (
            <Overlay anchor={[selectedListing.lat!, selectedListing.lon!]}>
              <Box
                onClick={e => e.stopPropagation()}
                style={{
                  transform: 'translate(-50%, calc(-100% - 130px))',
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  width: 240,
                  overflow: 'hidden',
                  border: '2px solid #FF8104',
                }}
              >
                {selectedListing.previewImage && (
                  <Image src={selectedListing.previewImage.url} h={130} fit="cover" />
                )}
                <Box p={12}>
                  <Text size="sm" fw={700} lineClamp={2} mb={4} style={{ color: '#1a1a2e' }}>
                    {selectedListing.title}
                  </Text>
                  {selectedListing.address && (
                    <Text size="xs" c="dimmed" lineClamp={1} mb={8}>{selectedListing.address}</Text>
                  )}
                  <Flex justify="space-between" align="center">
                    <Text size="md" fw={800} style={{ color: '#FF8104' }}>
                      {selectedListing.cost.payment} ₽/ч
                    </Text>
                    <Link
                      to={`/rent/${selectedListing.id}`}
                      style={{
                        fontSize: 13,
                        color: '#fff',
                        background: '#FF8104',
                        borderRadius: 8,
                        padding: '4px 12px',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Открыть →
                    </Link>
                  </Flex>
                </Box>
              </Box>
            </Overlay>
          )}
        </Map>

        {/* Подсказка если точка не выбрана */}
        {!clickedPoint && (
          <Box
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(26,26,46,0.82)',
              color: '#fff',
              borderRadius: 24,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 500,
              pointerEvents: 'none',
              backdropFilter: 'blur(6px)',
              whiteSpace: 'nowrap',
            }}
          >
            Кликните на карту, чтобы выбрать точку поиска
          </Box>
        )}

        {/* Нет результатов с координатами */}
        {clickedPoint && !isLoading && listings.length > 0 && withCoords.length === 0 && (
          <Box
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(26,26,46,0.82)',
              color: '#fff',
              borderRadius: 24,
              padding: '10px 22px',
              fontSize: 13,
              pointerEvents: 'none',
              backdropFilter: 'blur(6px)',
              whiteSpace: 'nowrap',
            }}
          >
            Найдено {listings.length} объявлений, у них не указаны координаты
          </Box>
        )}
      </Box>
    </Box>
  );
};
