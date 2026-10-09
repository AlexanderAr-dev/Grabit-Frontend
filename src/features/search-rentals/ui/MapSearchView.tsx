import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Flex, Image, Loader, Slider, Text, useMantineColorScheme } from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { IconMapPin, IconPackage } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { useNavigate } from 'react-router-dom';

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
const STORAGE_KEY = 'map_search_state';

interface MapState {
  center: [number, number];
  zoom: number;
  clickedPoint: [number, number] | null;
  radiusSlider: number;
  selectedId: string | null;
}

function loadMapState(): Partial<MapState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMapState(state: MapState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface MapSearchFilters {
  categoryId?: number | null;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  filters: MapSearchFilters;
}

export const MapSearchView = ({ filters }: Props) => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 576px)');
  const saved = useMemo(() => loadMapState(), []);

  const [center, setCenter] = useState<[number, number]>(saved.center ?? DEFAULT_CENTER);
  const [zoom, setZoom] = useState(saved.zoom ?? 10);
  const [clickedPoint, setClickedPoint] = useState<[number, number] | null>(saved.clickedPoint ?? null);
  const [radiusSlider, setRadiusSlider] = useState(saved.radiusSlider ?? 25);
  const [selectedId, setSelectedId] = useState<string | null>(saved.selectedId ?? null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    saveMapState({ center, zoom, clickedPoint, radiusSlider, selectedId });
  }, [center, zoom, clickedPoint, radiusSlider, selectedId]);

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
    staleTime: 60 * 1000,
  });

  const listings = data?.items ?? [];
  const withCoords = listings.filter((l): l is IRentalItem & { lat: number; lon: number } =>
    l.lat != null && l.lon != null
  );

  const selectedListing = selectedId
    ? withCoords.find(l => l.id === selectedId) ?? null
    : null;

  const handleMapClick = useCallback(({ latLng }: { latLng: [number, number] }) => {
    setClickedPoint(latLng);
    setSelectedId(null);
    setAddress(null);
  }, []);

  const panelBg = isDark ? '#1E293B' : '#f8f9fa';
  const panelBorder = isDark ? '#334155' : '#e9ecef';
  const textDim = isDark ? '#94A3B8' : '#868e96';

  return (
    <Box>
      {/* Слайдер радиуса */}
      <Box
        px={isMobile ? 12 : 20}
        py={14}
        mb={12}
        style={{ background: panelBg, borderRadius: 16, border: `1px solid ${panelBorder}` }}
      >
        <Flex align="center" gap={isMobile ? 12 : 20} wrap={isMobile ? 'wrap' : 'nowrap'}>
          <Text size="sm" fw={600} style={{ color: isDark ? '#F1F5F9' : '#1a1a2e', whiteSpace: 'nowrap' }}>
            Радиус:{' '}
            <span style={{ color: '#FF8104', fontSize: 15 }}>{radiusKm} км</span>
          </Text>
          <Box style={{ flex: 1, minWidth: isMobile ? '100%' : 0 }}>
            <Slider
              value={radiusSlider}
              onChange={setRadiusSlider}
              step={25}
              marks={RADIUS_MARKS}
              color="#FF8104"
              size="md"
              styles={{
                mark: { borderColor: isDark ? '#475569' : '#dee2e6' },
                markLabel: { fontSize: 12, color: textDim, marginTop: 6 },
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
                  — {withCoords.length} объявл.
                </Text>
            }
          </>
        )}
      </Flex>

      {/* Карта */}
      <Box style={{
        height: isMobile ? 420 : 680,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${panelBorder}`,
      }}>
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center: c, zoom: z }) => { setCenter(c); setZoom(z); }}
          onClick={handleMapClick}
        >
          {clickedPoint && (
            <Marker anchor={clickedPoint} width={42} color="#FF8104" />
          )}

          {withCoords.map(listing => {
            const isSelected = listing.id === selectedId;
            const size = isSelected ? 44 : 36;
            const color = isSelected ? '#e67300' : '#FF8104';
            return (
              <Overlay key={listing.id} anchor={[listing.lat, listing.lon]}>
                <Box
                  onClick={e => { e.stopPropagation(); setSelectedId(isSelected ? null : listing.id); }}
                  style={{
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.15s',
                  }}
                >
                  <Box
                    style={{
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      background: color,
                      border: '3px solid #fff',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(255,129,4,0.55)'
                        : '0 2px 8px rgba(0,0,0,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <IconPackage size={isSelected ? 22 : 18} color="#fff" stroke={2} />
                  </Box>
                  <Box
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `8px solid ${color}`,
                      marginTop: -1,
                    }}
                  />
                </Box>
              </Overlay>
            );
          })}

          {selectedListing && (
            <Overlay anchor={[selectedListing.lat, selectedListing.lon]}>
              <Box
                onClick={e => e.stopPropagation()}
                style={{
                  transform: 'translate(-50%, calc(-100% - 52px))',
                  background: isDark ? '#1E293B' : '#fff',
                  borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  width: isMobile ? 200 : 240,
                  overflow: 'hidden',
                  border: '2px solid #FF8104',
                }}
              >
                {selectedListing.previewImage && (
                  <Image src={selectedListing.previewImage.url} h={isMobile ? 100 : 130} fit="cover" />
                )}
                <Box p={isMobile ? 8 : 12}>
                  <Text size="sm" fw={700} lineClamp={2} mb={4} style={{ color: isDark ? '#F1F5F9' : '#1a1a2e' }}>
                    {selectedListing.title}
                  </Text>
                  {selectedListing.address && (
                    <Text size="xs" c="dimmed" lineClamp={1} mb={8}>{selectedListing.address}</Text>
                  )}
                  <Flex justify="space-between" align="center">
                    <Text size="md" fw={800} style={{ color: '#FF8104' }}>
                      {selectedListing.cost.payment} ₽/ч
                    </Text>
                    <Box
                      onClick={() => navigate(`/rent-page/${selectedListing.id}`)}
                      style={{
                        fontSize: 13,
                        color: '#fff',
                        background: '#FF8104',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Открыть →
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Overlay>
          )}
        </Map>

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
              padding: isMobile ? '8px 16px' : '10px 22px',
              fontSize: isMobile ? 13 : 14,
              fontWeight: 500,
              pointerEvents: 'none',
              backdropFilter: 'blur(6px)',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              textAlign: 'center',
              maxWidth: isMobile ? '80%' : undefined,
            }}
          >
            {isMobile ? 'Нажмите на карту для поиска' : 'Кликните на карту, чтобы выбрать точку поиска'}
          </Box>
        )}

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
