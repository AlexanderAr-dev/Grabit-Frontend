import {
  Badge,
  Card,
  Container,
  Divider,
  Group,
  List,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCheck, IconCrown, IconStar } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  subscriptionService,
  SubscriptionPlan,
} from '@shared/api/subscriptionService';
import { Button } from '@shared/ui';
import { useGetProfileInfo } from '@entities/user/model/useGetProfileInfo';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ru-RU');
};

interface PlanOption {
  plan: SubscriptionPlan;
  label: string;
  duration: string;
  price: string;
  highlight?: boolean;
}

const PLANS: PlanOption[] = [
  { plan: 'weekly', label: 'Недельный', duration: '7 дней', price: '149 ₽' },
  { plan: 'monthly', label: 'Месячный', duration: '30 дней', price: '399 ₽', highlight: true },
  { plan: 'quarterly', label: 'Квартальный', duration: '90 дней', price: '999 ₽' },
  { plan: 'yearly', label: 'Годовой', duration: '365 дней', price: '2 990 ₽' },
];

const PRO_FEATURES = [
  'Неограниченное количество объявлений',
  'Приоритетное отображение в поиске',
  'Значок PRO рядом с именем',
  'Расширенная аналитика объявлений',
];

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetProfileInfo();
  const user = data?.data.data;

  const [selected, setSelected] = useState<SubscriptionPlan>('monthly');

  const activateMutation = useMutation({
    mutationFn: () => subscriptionService.activate(selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/profile');
    },
  });

  if (isLoading) {
    return (
      <Container size="sm" py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
        <Loader color="#FF8104" />
      </Container>
    );
  }

  if (user?.isPremium) {
    return (
      <Container size="sm" py="xl">
        <Card shadow="sm" padding="xl" radius="lg" withBorder style={{ borderColor: '#FF8104', textAlign: 'center' }}>
          <IconCrown size={48} color="#FF8104" style={{ margin: '0 auto 16px' }} />
          <Title order={2} mb={8}>У вас уже есть PRO!</Title>
          <Text c="dimmed" mb="md">
            Подписка активна до {formatDate(user.subscriptionExpiresAt)}
          </Text>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            Вернуться в профиль
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack align="center" mb="xl">
        <Group gap={8}>
          <IconCrown size={32} color="#FF8104" />
          <Title order={1}>Grabit PRO</Title>
        </Group>
        <Text c="dimmed" ta="center" maw={420}>
          Получите премиум-доступ и публикуйте объявления без ограничений
        </Text>
      </Stack>

      <Card shadow="sm" padding="lg" radius="lg" withBorder mb="xl" style={{ borderColor: '#e2e8f0' }}>
        <Group mb="sm">
          <IconStar size={18} color="#FF8104" />
          <Text fw={600}>Возможности PRO</Text>
        </Group>
        <List
          spacing="xs"
          size="sm"
          icon={<IconCheck size={14} color="#FF8104" />}
        >
          {PRO_FEATURES.map(f => (
            <List.Item key={f}>{f}</List.Item>
          ))}
        </List>
      </Card>

      <Title order={3} mb="md">Выберите план</Title>

      <Stack gap="sm" mb="xl">
        {PLANS.map(({ plan, label, duration, price, highlight }) => (
          <Card
            key={plan}
            shadow="sm"
            padding="md"
            radius="lg"
            withBorder
            style={{
              borderColor: selected === plan ? '#FF8104' : highlight ? '#FFD6A5' : '#e2e8f0',
              borderWidth: selected === plan ? 2 : 1,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onClick={() => setSelected(plan)}
          >
            <Group justify="space-between" align="center">
              <Group gap={10}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${selected === plan ? '#FF8104' : '#ccc'}`,
                    background: selected === plan ? '#FF8104' : 'transparent',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                />
                <div>
                  <Group gap={6}>
                    <Text fw={600} size="sm">{label}</Text>
                    {highlight && (
                      <Badge size="xs" style={{ background: '#FF8104', color: '#fff' }}>
                        Популярный
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">{duration}</Text>
                </div>
              </Group>
              <Text fw={700} size="md">{price}</Text>
            </Group>
          </Card>
        ))}
      </Stack>

      <Divider mb="xl" />

      <Button
        fullWidth
        leftSection={<IconCrown size={18} />}
        isLoading={activateMutation.isPending}
        onClick={() => activateMutation.mutate()}
        style={{
          background: 'linear-gradient(135deg, #FF8104 0%, #FF5C00 100%)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          fontSize: 16,
          height: 48,
        }}
      >
        Активировать PRO
      </Button>

      {activateMutation.isError && (
        <Text c="red" size="sm" ta="center" mt="sm">
          Не удалось активировать подписку. Попробуйте ещё раз.
        </Text>
      )}

      <Text size="xs" c="dimmed" ta="center" mt="sm">
        Нажимая «Активировать PRO», вы соглашаетесь с условиями использования сервиса
      </Text>
    </Container>
  );
};
