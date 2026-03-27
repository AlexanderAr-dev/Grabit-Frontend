import { useState } from 'react';
import {
  ActionIcon,
  Divider,
  Flex,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { Button } from '@shared/ui';
import { Characteristic } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

const DetailsStep = ({ data, updateData, next, prev }: StepProps) => {
  const isSpace = data.type === 'space';

  const [title, setTitle] = useState(data.title ?? '');
  const [description, setDescription] = useState(data.description ?? '');
  const [pricePerHour, setPricePerHour] = useState<number | string>(
    data.pricePerHour ?? '',
  );

  // Custom characteristics
  const [characteristics, setCharacteristics] = useState<Characteristic[]>(
    data.characteristics ?? [],
  );
  const [charLabel, setCharLabel] = useState('');
  const [charValue, setCharValue] = useState('');

  // Space-specific predefined
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

  const handleNext = () => {
    if (!title.trim()) return;
    updateData({
      title: title.trim(),
      description: description.trim(),
      pricePerHour: Number(pricePerHour) || undefined,
      characteristics,
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
        required
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

      <Divider label="Характеристики" labelPosition="left" mt="sm" />

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
        <Button disabled={!title.trim()} onClick={handleNext}>Далее</Button>
      </Flex>
    </Stack>
  );
};

export default DetailsStep;
