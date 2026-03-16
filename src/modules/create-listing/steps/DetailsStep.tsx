import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { listingOptions } from '@modules/create-listing/constants/options.ts';
import { StepProps } from '@modules/create-listing/types/StepProps.ts';
import { IconTrash } from '@tabler/icons-react';

const DetailsStep = ({
  data,
  updateData,
  next,
  prev,
}: StepProps) => {
  const [title, setTitle] = useState(data.title ?? '');
  const [description, setDescription] = useState(
    data.description ?? '',
  );

  const [features, setFeatures] = useState<string[]>(
    data.features ?? [],
  );
  const [featureInput, setFeatureInput] = useState('');

  const [options, setOptions] = useState<
    Record<string, number>
  >(
    Object.fromEntries(
      (data.options ?? []).map(o => [o.key, o.value]),
    ),
  );

  const addFeature = () => {
    if (!featureInput.trim()) return;

    setFeatures([...features, featureInput]);
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateData({
      title,
      description,
      features,
      options: Object.entries(options).map(
        ([key, value]) => ({
          key,
          label:
            listingOptions.find(o => o.key === key)
              ?.label ?? key,
          value,
        }),
      ),
    });

    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Информация об объявлении</Title>

      <TextInput
        label="Название"
        placeholder="Например: Камера Sony A7 III"
        value={title}
        onChange={e => setTitle(e.currentTarget.value)}
        required
      />

      <Textarea
        label="Описание"
        placeholder="Опишите состояние, комплектацию и особенности"
        value={description}
        onChange={e =>
          setDescription(e.currentTarget.value)
        }
        minRows={4}
      />

      {/* FEATURES */}

      <Title order={4}>Комплектация</Title>

      <Group>
        <TextInput
          placeholder="Например: 2 батареи"
          value={featureInput}
          onChange={e =>
            setFeatureInput(e.currentTarget.value)
          }
        />

        <Button onClick={addFeature}>Добавить</Button>
      </Group>

      <Stack>
        {features.map((feature, index) => (
          <Paper key={index} p="sm" withBorder>
            <Group justify="space-between">
              {feature}

              <ActionIcon
                color="red"
                onClick={() => removeFeature(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Paper>
        ))}
      </Stack>

      {/* OPTIONS */}

      <Title order={4}>Параметры</Title>

      <Stack>
        {listingOptions.map(option => (
          <NumberInput
            key={option.key}
            label={option.label}
            placeholder="0"
            min={0}
            value={options[option.key] ?? ''}
            onChange={value =>
              setOptions({
                ...options,
                [option.key]: Number(value),
              })
            }
          />
        ))}
      </Stack>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={prev}>
          Назад
        </Button>

        <Button onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default DetailsStep;
