import { useEffect, useState } from 'react';
import {
  Box,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Map, Marker } from 'pigeon-maps';

import { Button } from '@shared/ui';
import { StepProps } from '../model/types/StepProps';

// Включить/выключить обязательность выбора локации
const VALIDATION_ENABLED = false;

const DEFAULT_CENTER: [number, number] = [55.751574, 37.573856]; // Москва
const DEFAULT_ZOOM = 10;
const SELECTED_ZOOM = 15;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const LocationStep = ({ data, updateData, next, prev }: StepProps) => {
  const [coords, setCoords] = useState<[number, number] | null>(
    data.location ? [data.location.lat, data.location.lng] : null,
  );
  const [address, setAddress] = useState(data.address ?? '');
  const [searchQuery, setSearchQuery] = useState(data.address ?? '');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 500);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [zoom, setZoom] = useState(coords ? SELECTED_ZOOM : DEFAULT_ZOOM);
  const [center, setCenter] = useState<[number, number]>(coords ?? DEFAULT_CENTER);

  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!query || query === address) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`,
      { signal: controller.signal, headers: { 'Accept-Language': 'ru' } },
    )
      .then(r => r.json())
      .then((results: NominatimResult[]) => setSuggestions(results))
      .catch(err => { if (err.name !== 'AbortError') setSuggestions([]); })
      .finally(() => setIsSearching(false));

    return () => controller.abort();
  }, [debouncedQuery, address]);

  const selectSuggestion = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const newCoords: [number, number] = [lat, lng];
    setCoords(newCoords);
    setCenter(newCoords);
    setZoom(SELECTED_ZOOM);
    setAddress(item.display_name);
    setSearchQuery(item.display_name);
    setSuggestions([]);
  };

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setCoords([lat, lng]);

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: controller.signal, headers: { 'Accept-Language': 'ru' } },
    )
      .then(r => r.json())
      .then(res => {
        const name: string = res.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddress(name);
        setSearchQuery(name);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(fallback);
          setSearchQuery(fallback);
        }
      });
  };

  const handleNext = () => {
    if (VALIDATION_ENABLED && !coords) return;
    updateData({
      location: coords ? { lat: coords[0], lng: coords[1] } : undefined,
      address: address || undefined,
    });
    next?.();
  };

  const canProceed = !VALIDATION_ENABLED || !!coords;

  return (
    <Stack gap="md">
      <Title order={2}>Местоположение</Title>
      <Text c="dimmed" size="sm">
        Введите адрес или кликните на карту, чтобы указать местоположение объявления.
      </Text>

      {/* Поиск */}
      <Box style={{ position: 'relative' }}>
        <TextInput
          label="Адрес"
          placeholder="Например: Москва, ул. Тверская, 1"
          value={searchQuery}
          onChange={e => setSearchQuery(e.currentTarget.value)}
          rightSection={isSearching ? <Loader size="xs" /> : null}
        />

        {suggestions.length > 0 && (
          <Box
            style={{
              position: 'absolute',
              zIndex: 1000,
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #dee2e6',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {suggestions.map((item, i) => (
              <UnstyledButton
                key={i}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  textAlign: 'left',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f1f3f5' : undefined,
                }}
                onClick={() => selectSuggestion(item)}
              >
                <Text size="sm" lineClamp={2}>{item.display_name}</Text>
              </UnstyledButton>
            ))}
          </Box>
        )}
      </Box>

      {/* Карта */}
      <Box style={{ height: 360, borderRadius: 12, overflow: 'hidden' }}>
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center: c, zoom: z }) => { setCenter(c); setZoom(z); }}
          onClick={handleMapClick}
        >
          {coords && <Marker anchor={coords} />}
        </Map>
      </Box>

      {coords && (
        <Text size="xs" c="dimmed">
          Координаты: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
        </Text>
      )}

      <Group justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!canProceed} onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default LocationStep;
