import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { Button } from '@shared/ui';
import { categoriesByType } from '../model/constants/categoryData';
import { CategoryNode } from '../model/constants/Categories';
import { Characteristic } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

// Включить/выключить обязательность заполнения полей
const VALIDATION_ENABLED = false;

interface CategoryColumnProps {
  items: CategoryNode[];
  selectedId?: string;
  onSelect: (item: CategoryNode) => void;
}

const CategoryColumn = ({ items, selectedId, onSelect }: CategoryColumnProps) => (
  <Stack gap={4}>
    {items.map(item => (
      <Paper
        key={item.id}
        p="xs"
        withBorder
        style={{
          cursor: 'pointer',
          background: selectedId === item.id ? '#fff4e6' : undefined,
          borderColor: selectedId === item.id ? '#FF8104' : undefined,
        }}
        onClick={() => onSelect(item)}
      >
        <Text size="sm">{item.name}</Text>
      </Paper>
    ))}
  </Stack>
);

const DetailsStep = ({ data, updateData, next, prev }: StepProps) => {
  const isSpace = data.type === 'space';

  const [title, setTitle] = useState(data.title ?? '');
  const [description, setDescription] = useState(data.description ?? '');
  const [pricePerHour, setPricePerHour] = useState<number | string>(
    data.pricePerHour ?? '',
  );

  // Категория
  const rootCategories = categoriesByType[data.type] ?? [];

  const [level1, setLevel1] = useState<CategoryNode | null>(() => {
    if (!data.categoryId) return null;
    for (const c1 of rootCategories) {
      if (c1.id === data.categoryId) return c1;
      for (const c2 of c1.children ?? []) {
        if (c2.id === data.categoryId) return c1;
        if (c2.children?.some(c3 => c3.id === data.categoryId)) return c1;
      }
    }
    return null;
  });

  const [level2, setLevel2] = useState<CategoryNode | null>(() => {
    if (!data.categoryId) return null;
    for (const c1 of rootCategories) {
      for (const c2 of c1.children ?? []) {
        if (c2.id === data.categoryId) return c2;
        if (c2.children?.some(c3 => c3.id === data.categoryId)) return c2;
      }
    }
    return null;
  });

  const [level3, setLevel3] = useState<CategoryNode | null>(() => {
    if (!data.categoryId) return null;
    for (const c1 of rootCategories) {
      for (const c2 of c1.children ?? []) {
        const found = c2.children?.find(c3 => c3.id === data.categoryId);
        if (found) return found;
      }
    }
    return null;
  });

  // Характеристики
  const [characteristics, setCharacteristics] = useState<Characteristic[]>(
    data.characteristics ?? [],
  );
  const [charLabel, setCharLabel] = useState('');
  const [charValue, setCharValue] = useState('');

  // Space-specific
  const [bathrooms, setBathrooms] = useState<number | string>(
    data.spaceDetails?.bathrooms ?? '',
  );
  const [sleepingPlaces, setSleepingPlaces] = useState<number | string>(
    data.spaceDetails?.sleepingPlaces ?? '',
  );
  const [hasSauna, setHasSauna] = useState(data.spaceDetails?.hasSauna ?? false);

  const addCharacteristic = () => {
    if (!charLabel.trim() || !charValue.trim()) return;
    setCharacteristics(prev => [
      ...prev,
      { label: charLabel.trim(), value: charValue.trim() },
    ]);
    setCharLabel('');
    setCharValue('');
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCategoryId = level3?.id ?? level2?.id ?? level1?.id;

  const handleNext = () => {
    if (VALIDATION_ENABLED && !title.trim()) return;
    updateData({
      title: title.trim(),
      description: description.trim(),
      pricePerHour: Number(pricePerHour) || undefined,
      characteristics,
      categoryId: selectedCategoryId,
      ...(isSpace && {
        spaceDetails: {
          bathrooms: Number(bathrooms) || undefined,
          sleepingPlaces: Number(sleepingPlaces) || undefined,
          hasSauna,
        },
      }),
    });
    next?.();
  };

  const canProceed = !VALIDATION_ENABLED || !!title.trim();

  return (
    <Stack gap="md">
      <Title order={2}>Информация об объявлении</Title>

      <TextInput
        label="Название"
        placeholder={
          isSpace ? 'Например: Уютная студия в центре' : 'Например: Sony PlayStation 5'
        }
        value={title}
        onChange={e => setTitle(e.currentTarget.value)}
        required={VALIDATION_ENABLED}
      />

      <Textarea
        label="Описание"
        placeholder="Расскажите подробнее об условиях аренды, состоянии и особенностях"
        value={description}
        onChange={e => setDescription(e.currentTarget.value)}
        minRows={4}
        autosize
      />

      <NumberInput
        label="Стоимость за час (₽)"
        placeholder="0"
        min={0}
        value={pricePerHour}
        onChange={setPricePerHour}
        w={200}
      />

      {/* Категория */}
      <Divider label="Категория" labelPosition="left" mt="sm" />

      {level1 && level2 && level3 && (
        <Text size="sm" c="dimmed">
          Выбрано:{' '}
          <Text span fw={600} c="dark">
            {level1.name} → {level2.name} → {level3.name}
          </Text>
        </Text>
      )}

      <Box style={{ overflowX: 'auto' }}>
        <Flex gap="sm" style={{ minWidth: 480 }}>
          <Box style={{ flex: 1, minWidth: 140 }}>
            <Text size="xs" c="dimmed" mb={6} fw={500}>Раздел</Text>
            <CategoryColumn
              items={rootCategories}
              selectedId={level1?.id}
              onSelect={item => { setLevel1(item); setLevel2(null); setLevel3(null); }}
            />
          </Box>

          {level1?.children && (
            <Box style={{ flex: 1, minWidth: 140 }}>
              <Text size="xs" c="dimmed" mb={6} fw={500}>Подраздел</Text>
              <CategoryColumn
                items={level1.children}
                selectedId={level2?.id}
                onSelect={item => { setLevel2(item); setLevel3(null); }}
              />
            </Box>
          )}

          {level2?.children && (
            <Box style={{ flex: 1, minWidth: 140 }}>
              <Text size="xs" c="dimmed" mb={6} fw={500}>Категория</Text>
              <CategoryColumn
                items={level2.children}
                selectedId={level3?.id}
                onSelect={item => setLevel3(item)}
              />
            </Box>
          )}
        </Flex>
      </Box>

      {isSpace && (
        <>
          <Divider label="Характеристики помещения" labelPosition="left" mt="sm" />

          <Flex gap="md" wrap="wrap">
            <NumberInput
              label="Ванных комнат"
              placeholder="0"
              min={0}
              value={bathrooms}
              onChange={setBathrooms}
              w={160}
            />
            <NumberInput
              label="Спальные места"
              placeholder="0"
              min={0}
              value={sleepingPlaces}
              onChange={setSleepingPlaces}
              w={160}
            />
          </Flex>

          <Switch
            label="Сауна"
            checked={hasSauna}
            onChange={e => setHasSauna(e.currentTarget.checked)}
            size="md"
          />
        </>
      )}

      <Divider label="Дополнительные характеристики" labelPosition="left" mt="sm" />

      <Flex gap="sm" align="flex-end">
        <TextInput
          label="Название"
          placeholder={isSpace ? 'Балкон' : 'Геймпад'}
          value={charLabel}
          onChange={e => setCharLabel(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <TextInput
          label="Значение"
          placeholder={isSpace ? 'Есть' : '2 шт.'}
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
                border: '1px solid #e9ecef',
                background: '#f8f9fa',
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

      <Flex gap="md" justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!canProceed} onClick={handleNext}>Далее</Button>
      </Flex>
    </Stack>
  );
};

export default DetailsStep;
