import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Divider,
  Flex,
  NumberInput,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useGetRentInfoById } from '@entities/rental';
import { rentService } from '@shared/api';
import { Button } from '@shared/ui';
import { Characteristic } from '@features/create-listing';
import { EditListingLayout } from './EditListingLayout';
import { EditMediaSection } from './EditMediaSection';

export const EditListingInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: listing, isLoading } = useGetRentInfoById(id ?? '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number | string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [charLabel, setCharLabel] = useState('');
  const [charValue, setCharValue] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Reset form when navigating between different listings
  useEffect(() => {
    setInitialized(false);
  }, [id]);

  useEffect(() => {
    if (listing && !initialized) {
      setTitle(listing.title ?? '');
      setDescription(listing.description ?? '');
      setPricePerHour(listing.cost.payment ?? '');
      setQuantity(listing.quantity ?? 1);
      setCharacteristics(
        (listing.attributes ?? []).map(a => ({ label: a.key, value: a.value })),
      );
      setInitialized(true);
    }
  }, [listing, initialized]);

  const { mutate: saveInfo, isPending: isSaving } = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('Missing id'));
      const [lat, lon] = listing?.coordinates
        ? listing.coordinates.split(',').map(Number)
        : [undefined, undefined];
      return rentService.updateListing(id, {
        title,
        description,
        price_per_hour: Number(pricePerHour),
        quantity: Number(quantity) || 1,
        attributes: characteristics.map(c => ({ key: c.label, value: c.value })),
        category_id: listing?.category.id,
        address: listing?.address || undefined,
        lat: Number.isFinite(lat) ? lat : undefined,
        lon: Number.isFinite(lon) ? lon : undefined,
        buffer_hours: listing?.bufferHours,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentAd', id] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate(`/edit-listing/${id}/calendar`);
    },
  });

  const addCharacteristic = () => {
    if (!charLabel.trim() || !charValue.trim()) return;
    setCharacteristics(prev => [...prev, { label: charLabel.trim(), value: charValue.trim() }]);
    setCharLabel('');
    setCharValue('');
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <EditListingLayout>
        <Stack gap="md">
          <Skeleton height={28} width="40%" radius="md" />
          <Stack gap={6}>
            <Skeleton height={14} width={80} radius="sm" />
            <Skeleton height={40} radius="md" />
          </Stack>
          <Stack gap={6}>
            <Skeleton height={14} width={80} radius="sm" />
            <Skeleton height={100} radius="md" />
          </Stack>
          <Stack gap={6}>
            <Skeleton height={14} width={140} radius="sm" />
            <Skeleton height={40} width={200} radius="md" />
          </Stack>
          <Skeleton height={1} mt={8} />
          <Skeleton height={24} width="30%" radius="md" mt={4} />
          <SimpleGrid cols={3} spacing="sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <Flex justify="space-between" mt="xl">
            <Skeleton height={40} width={120} radius="md" />
            <Skeleton height={40} width={180} radius="md" />
          </Flex>
        </Stack>
      </EditListingLayout>
    );
  }

  return (
    <EditListingLayout>
      <Stack gap="md">
        <Title order={3}>Основная информация</Title>

        <TextInput
          label="Название"
          value={title}
          onChange={e => setTitle(e.currentTarget.value)}
        />

        <Textarea
          label="Описание"
          value={description}
          onChange={e => setDescription(e.currentTarget.value)}
          minRows={4}
          autosize
        />

        <NumberInput
          label="Стоимость (₽/час)"
          min={0}
          value={pricePerHour}
          onChange={setPricePerHour}
          w={200}
        />

        <NumberInput
          label="Количество единиц"
          description="Сколько экземпляров доступно для аренды одновременно"
          min={1}
          value={quantity}
          onChange={setQuantity}
          w={200}
        />

        <Divider mt="sm" />
        {id && (
          <EditMediaSection
            listingId={id}
            media={listing?.media ?? []}
          />
        )}

        <Divider label="Характеристики" labelPosition="left" mt="sm" />

        <Flex gap="sm" align="flex-end">
          <TextInput
            label="Название"
            placeholder="Балкон"
            value={charLabel}
            onChange={e => setCharLabel(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            label="Значение"
            placeholder="Есть"
            value={charValue}
            onChange={e => setCharValue(e.currentTarget.value)}
            style={{ flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && addCharacteristic()}
          />
          <ActionIcon
            size={36}
            variant="filled"
            style={{ backgroundColor: '#FF8104', marginBottom: 1 }}
            onClick={addCharacteristic}
            disabled={!charLabel.trim() || !charValue.trim()}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Flex>

        {characteristics.length > 0 && (
          <Stack gap={6}>
            {characteristics.map((char, index) => (
              <Flex
                key={index}
                align="center"
                justify="space-between"
                px="sm"
                py={8}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${isDark ? '#333' : '#e9ecef'}`,
                  background: isDark ? '#2a2a2a' : '#f8f9fa',
                }}
              >
                <Text size="sm">
                  <Text span fw={600}>{char.label}</Text>
                  <Text span c="dimmed"> — </Text>
                  {char.value}
                </Text>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => removeCharacteristic(index)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Flex>
            ))}
          </Stack>
        )}

        <Flex gap="md" justify="space-between" mt="xl">
          <Button variant="secondary" onClick={() => navigate('/my-products')}>
            Отмена
          </Button>
          <Button onClick={() => saveInfo()} isLoading={isSaving} disabled={!id}>
            Сохранить и далее →
          </Button>
        </Flex>
      </Stack>
    </EditListingLayout>
  );
};
