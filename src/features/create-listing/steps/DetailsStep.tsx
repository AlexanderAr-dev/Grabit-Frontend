import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  NumberInput,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { BackendCategory } from '@shared/api';
import { rentService } from '@shared/api';
import { Button } from '@shared/ui';
import { Characteristic } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

const VALIDATION_ENABLED = false;

interface CatNode extends BackendCategory {
  children?: CatNode[];
}

function buildTree(cats: BackendCategory[]): CatNode[] {
  const getChildren = (parentId: number): CatNode[] =>
    cats
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => ({ ...c, children: getChildren(c.id) }));

  return cats
    .filter(c => c.parent_id == null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(root => ({ ...root, children: getChildren(root.id) }));
}

function findPath(tree: CatNode[], targetId: number): [CatNode | null, CatNode | null, CatNode | null] {
  for (const l1 of tree) {
    if (l1.id === targetId) return [l1, null, null];
    for (const l2 of l1.children ?? []) {
      if (l2.id === targetId) return [l1, l2, null];
      for (const l3 of l2.children ?? []) {
        if (l3.id === targetId) return [l1, l2, l3];
      }
    }
  }
  return [null, null, null];
}

interface CategoryColumnProps {
  items: CatNode[];
  selectedId?: number;
  onSelect: (item: CatNode) => void;
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
  const [quantity, setQuantity] = useState<number | string>(
    data.quantity ?? 1,
  );

  const { data: rawCategories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: rentService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const rootCategories = rawCategories ? buildTree(rawCategories) : [];

  const [level1, setLevel1] = useState<CatNode | null>(null);
  const [level2, setLevel2] = useState<CatNode | null>(null);
  const [level3, setLevel3] = useState<CatNode | null>(null);

  // Восстанавливаем выбранную категорию из черновика после загрузки дерева
  useEffect(() => {
    if (!data.categoryId || rootCategories.length === 0) return;
    const [l1, l2, l3] = findPath(rootCategories, data.categoryId);
    setLevel1(l1);
    setLevel2(l2);
    setLevel3(l3);
  }, [rawCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  const [characteristics, setCharacteristics] = useState<Characteristic[]>(
    data.characteristics ?? [],
  );
  const [charLabel, setCharLabel] = useState('');
  const [charValue, setCharValue] = useState('');

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

  const selectedCategoryId: number | undefined = level3?.id ?? level2?.id ?? level1?.id;

  const handleNext = () => {
    if (VALIDATION_ENABLED && !title.trim()) return;
    updateData({
      title: title.trim(),
      description: description.trim(),
      pricePerHour: Number(pricePerHour) || undefined,
      quantity: Number(quantity) || 1,
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

      <NumberInput
        label="Количество единиц"
        description="Сколько экземпляров доступно для аренды одновременно"
        placeholder="1"
        min={1}
        value={quantity}
        onChange={setQuantity}
        w={200}
      />

      {/* Категория */}
      <Divider label="Категории" labelPosition="left" mt="sm" />

      {level1 && (
        <Text size="sm" c="dimmed">
          Выбрано:{' '}
          <Text span fw={600} c="dark">
            {[level1.name, level2?.name, level3?.name].filter(Boolean).join(' → ')}
          </Text>
        </Text>
      )}

      {catLoading ? (
        <Flex gap="sm">
          <Skeleton height={120} width={140} radius="sm" />
          <Skeleton height={120} width={140} radius="sm" />
          <Skeleton height={120} width={140} radius="sm" />
        </Flex>
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Flex gap="sm" style={{ minWidth: 480 }}>
            <Box style={{ flex: 1, minWidth: 140 }}>
              <Text size="xs" c="dimmed" mb={6} fw={500}>Категория</Text>
              <CategoryColumn
                items={rootCategories}
                selectedId={level1?.id}
                onSelect={item => { setLevel1(item); setLevel2(null); setLevel3(null); }}
              />
            </Box>

            {level1?.children && level1.children.length > 0 && (
              <Box style={{ flex: 1, minWidth: 140 }}>
                <Text size="xs" c="dimmed" mb={6} fw={500}>Подкатегория</Text>
                <CategoryColumn
                  items={level1.children}
                  selectedId={level2?.id}
                  onSelect={item => { setLevel2(item); setLevel3(null); }}
                />
              </Box>
            )}

            {level2?.children && level2.children.length > 0 && (
              <Box style={{ flex: 1, minWidth: 140 }}>
                <Text size="xs" c="dimmed" mb={6} fw={500}>Уточнение</Text>
                <CategoryColumn
                  items={level2.children}
                  selectedId={level3?.id}
                  onSelect={item => setLevel3(item)}
                />
              </Box>
            )}
          </Flex>
        </Box>
      )}

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
