import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Anchor, Box, Card, Container, Flex, Loader, Progress, Text, useMantineColorScheme } from '@mantine/core';
import { IconAlertCircle, IconCrown } from '@tabler/icons-react';
import axios from 'axios';

import { rentService } from '@shared/api';
import { componentsTheme } from '@shared/config';
import { Button } from '@shared/ui';
import { WeekDay } from '@shared/types';
import { CreateListingData } from '../model/types/CreateListing';
import { StepComponent, wizardSteps } from '../model/constants/wizardSteps';
import TypeStep from '../steps/TypeStep';

const TRANSITION_MS = 180;
const DRAFT_KEY = 'grabit_listing_draft';

const DAY_NUM: Record<WeekDay, string> = {
  mon: '1', tue: '2', wed: '3', thu: '4', fri: '5', sat: '6', sun: '7',
};

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
    return { ...parsed, media: undefined, previewIndex: undefined };
  } catch {
    return { type: 'item_rent' };
  }
};

const saveDraft = (data: CreateListingData) => {
  try {
    const { media: _, previewIndex: __, ...rest } = data;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  } catch {
    // ignore quota errors
  }
};

const CreateListingWizard = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const cardStyle = componentsTheme.cardTheme[colorScheme].primary;
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<CreateListingData>(loadDraft);
  // Mirrors data state but updated synchronously in updateData so submitListing
  // always sees the latest values even when called right after updateData.
  const latestDataRef = useRef<CreateListingData>(data);
  const [visible, setVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLimitError, setIsLimitError] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  const typeSteps: StepComponent[] = wizardSteps[data.type] ?? [];
  const allSteps: StepComponent[] = [TypeStep, ...typeSteps];
  const CurrentStep = allSteps[stepIndex];
  const totalSteps = allSteps.length;
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  const stepTitle = STEP_TITLES[stepIndex] ?? '';

  const updateData = (values: Partial<CreateListingData>) => {
    const merged = { ...latestDataRef.current, ...values };
    latestDataRef.current = merged;
    setData(() => {
      saveDraft(merged);
      return merged;
    });
  };

  const transition = (targetIndex: number) => {
    setVisible(false);
    setTimeout(() => {
      setStepIndex(targetIndex);
      setVisible(true);
    }, TRANSITION_MS);
  };

  const submitListing = async () => {
    // Use latestDataRef so that schedule from DayScheduleStep (the last step) is
    // always included even though the React state update is still pending.
    const currentData = latestDataRef.current;

    if (!currentData.categoryId) {
      setSubmitError('Выберите категорию объявления.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Шаг 1: создать листинг (пропускаем при ретрае если уже создан)
      let listingId = createdListingId;
      if (!listingId) {
        const listing = await rentService.createListing({
          title: currentData.title ?? '',
          description: currentData.description ?? '',
          category_id: currentData.categoryId!,
          price_per_hour: currentData.pricePerHour ?? 1,
          quantity: currentData.quantity ?? 1,
          buffer_hours: 1,
          lat: currentData.location?.lat,
          lon: currentData.location?.lng,
          address: currentData.address,
          attributes: currentData.characteristics?.map(c => ({ key: c.label, value: c.value })) ?? [],
        });
        listingId = listing.listing_id;
        setCreatedListingId(listingId);
      }

      // Шаг 2: установить доступность
      if (currentData.booking?.availabilityRange && currentData.booking.enabledDays?.length) {
        const weekday_hours: Record<string, number[]> = {};
        currentData.booking.enabledDays.forEach(day => {
          const daySchedule = currentData.booking!.schedule?.find(s => s.day === day);
          weekday_hours[DAY_NUM[day]] = daySchedule
            ? daySchedule.hours.map((on, i) => (on ? i : -1)).filter(i => i >= 0)
            : [];
        });
        await rentService.setAvailability(listingId, [
          {
            valid_from: currentData.booking.availabilityRange.start,
            valid_until: currentData.booking.availabilityRange.end,
            weekday_hours,
          },
        ]);

        // Сохраняем доступность для предзаполнения страницы редактирования
        const savedSchedule: Record<WeekDay, boolean[]> = {} as Record<WeekDay, boolean[]>;
        const allDays: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        allDays.forEach(day => {
          const ds = currentData.booking!.schedule?.find(s => s.day === day);
          savedSchedule[day] = ds ? ds.hours : Array(24).fill(true);
        });
        try {
          localStorage.setItem(
            `grabit_avail_${listingId}`,
            JSON.stringify({
              startDate: currentData.booking.availabilityRange.start,
              endDate: currentData.booking.availabilityRange.end,
              enabledDays: currentData.booking.enabledDays,
              schedule: savedSchedule,
            }),
          );
        } catch {
          // ignore quota
        }
      }

      // Шаг 3: загрузить медиа
      const allMedia = currentData.media ?? [];
      const photos = allMedia.filter(mf => mf.file && mf.type !== 'video');
      const videoFile = allMedia.find(mf => mf.file && mf.type === 'video');

      await Promise.allSettled(
        photos.map((mf, i) =>
          rentService.uploadPhoto({ listingId: listingId!, file: mf.file!, sort_order: i + 1 })
        ),
      );

      if (videoFile?.file) {
        await rentService.uploadVideo({ listingId: listingId!, file: videoFile.file, sort_order: 1 });
      }

      localStorage.removeItem(DRAFT_KEY);
      navigate('/my-products');
    } catch (err) {
      console.error('[CreateListing] submit error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setIsLimitError(true);
        setSubmitError('Достигнут лимит объявлений для бесплатного аккаунта (3 шт.).');
      } else {
        setIsLimitError(false);
        setSubmitError('Не удалось создать объявление. Проверьте данные и попробуйте ещё раз.');
      }
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (stepIndex >= allSteps.length - 1) {
      submitListing();
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

        {isSubmitting ? (
          <Flex direction="column" align="center" gap="md" py="xl">
            <Loader color="#FF8104" size="md" />
            <Text size="sm" c="dimmed">Создаём объявление...</Text>
          </Flex>
        ) : (
          <>
            {submitError && (
              <Alert
                icon={isLimitError ? <IconCrown size={16} /> : <IconAlertCircle size={16} />}
                color={isLimitError ? 'orange' : 'red'}
                radius="md"
                mb="md"
                onClose={() => { setSubmitError(null); setIsLimitError(false); }}
                withCloseButton
              >
                {submitError}
                {isLimitError && (
                  <Text size="sm" mt={4}>
                    Оформите{' '}
                    <Anchor href="/subscription" fw={600} c="#FF8104">
                      PRO-подписку
                    </Anchor>
                    {' '}для неограниченного количества объявлений.
                  </Text>
                )}
              </Alert>
            )}

            <Box
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(6px)',
                transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
              }}
            >
              <CurrentStep data={data} updateData={updateData} next={next} prev={prev} />
            </Box>

            {submitError && (
              <Flex justify="flex-end" mt="md">
                <Button onClick={submitListing}>Попробовать ещё раз</Button>
              </Flex>
            )}
          </>
        )}
      </Card>
    </Container>
  );
};

export default CreateListingWizard;
