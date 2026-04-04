import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Container, Progress, Text, useMantineColorScheme } from '@mantine/core';

import { componentsTheme } from '@shared/config';
import { CreateListingData } from '../model/types/CreateListing';
import { StepComponent, wizardSteps } from '../model/constants/wizardSteps';
import TypeStep from '../steps/TypeStep';

const TRANSITION_MS = 180;
const DRAFT_KEY = 'grabit_listing_draft';
const SAVED_KEY = 'grabit_listing_saved';

// Названия шагов по позиции: 0 = TypeStep, далее — по порядку из wizardSteps
// Индекс 0 всегда TypeStep, 1..N — commonSteps
const STEP_TITLES = [
  'Тип объявления',
  'Информация',
  'Фото и видео',
  'Местоположение',
  'Период доступности',
  'Дни аренды',
  'Расписание',
];

const loadDraft = (): CreateListingData => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { type: 'item_rent' };
    const parsed = JSON.parse(raw) as CreateListingData;
    // media (object URLs) не переживают перезагрузку — сбрасываем
    return { ...parsed, media: undefined, previewIndex: undefined };
  } catch {
    return { type: 'item_rent' };
  }
};

const saveDraft = (data: CreateListingData) => {
  try {
    // object URL-ы нельзя сериализовать — сохраняем без media
    const { media: _, previewIndex: __, ...rest } = data;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  } catch {
    // игнорируем ошибки quota
  }
};

const CreateListingWizard = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const cardStyle = componentsTheme.cardTheme[colorScheme].primary;
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<CreateListingData>(loadDraft);
  const [visible, setVisible] = useState(true);

  const typeSteps: StepComponent[] = wizardSteps[data.type] ?? [];
  const allSteps: StepComponent[] = [TypeStep, ...typeSteps];
  const CurrentStep = allSteps[stepIndex];
  const totalSteps = allSteps.length;
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  const stepTitle = STEP_TITLES[stepIndex] ?? '';

  const updateData = (values: Partial<CreateListingData>) => {
    setData(prev => {
      const next = { ...prev, ...values };
      saveDraft(next);
      return next;
    });
  };

  const transition = (targetIndex: number) => {
    setVisible(false);
    setTimeout(() => {
      setStepIndex(targetIndex);
      setVisible(true);
    }, TRANSITION_MS);
  };

  const next = () => {
    if (stepIndex >= allSteps.length - 1) {
      // Сохраняем финальный черновик и очищаем рабочий
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify({ ...data, media: undefined }));
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      navigate('/my-products');
    } else {
      transition(stepIndex + 1);
    }
  };

  const prev = () => {
    if (stepIndex === 0) {
      navigate('/my-products');
    } else {
      transition(stepIndex - 1);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Text size="xs" c="dimmed" mb={6}>
        Шаг {stepIndex + 1} из {totalSteps}
        {stepTitle ? ` · ${stepTitle}` : ''}
      </Text>

      <Card
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          backgroundColor: cardStyle.backgroundColor,
          border: `2px solid ${cardStyle.borderColor}`,
        }}
      >
        <Progress
          value={progress}
          mb="xl"
          radius="xl"
          color="#FF8104"
        />

        <Box
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
          }}
        >
          <CurrentStep data={data} updateData={updateData} next={next} prev={prev} />
        </Box>
      </Card>
    </Container>
  );
};

export default CreateListingWizard;
