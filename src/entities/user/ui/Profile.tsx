import {
  Avatar,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Overlay,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCamera,
  IconEdit,
  IconLogout,
  IconPackage,
  IconStar,
  IconTrash,
  IconMessage,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth';
import { UserService } from '@shared/api';
import { Button } from '@shared/ui';
import { useGetProfileInfo } from '../model/useGetProfileInfo';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const formatGender = (gender?: string) => {
  if (gender === 'male') return 'Мужской';
  if (gender === 'female') return 'Женский';
  return gender ?? null;
};

export const Profile = () => {
  const { data, isLoading } = useGetProfileInfo();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = data?.data.data;

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    gender: '',
  });

  const updateMutation = useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      close();
    },
  });

  const avatarMutation = useMutation({
    mutationFn: UserService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: UserService.deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleOpen = () => {
    if (!user) return;
    setForm({
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phoneNumber ?? '',
      birth_date: user.birthDate ?? '',
      gender: user.gender ?? '',
    });
    open();
  };

  const handleSave = () => {
    updateMutation.mutate({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      birth_date: form.birth_date || undefined,
      gender: form.gender || undefined,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarMutation.mutate(file);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Loader color="#FF8104" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Text c="dimmed">Не удалось загрузить профиль. Пожалуйста, войдите в систему.</Text>
      </Container>
    );
  }

  return (
    <>
      <Container size="sm" py="xl">
        <Group justify="space-between" mb="lg" wrap="nowrap" align="flex-start">
          <div style={{ flex: 1 }}>
            <Title order={1}>{user.firstName} {user.lastName}</Title>
            <Text c="dimmed" size="md" mt={4}>@{user.login}</Text>
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              size={120}
              radius="md"
              src={user.avatar?.url || '/placeholder.jpg'}
              alt={user.name}
            />
            {(avatarMutation.isPending || deleteAvatarMutation.isPending) ? (
              <Overlay radius="md" color="#000" backgroundOpacity={0.5} center>
                <Loader size="sm" color="white" />
              </Overlay>
            ) : (
              <Overlay
                radius="md"
                color="#000"
                backgroundOpacity={0}
                style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingBottom: 8, opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.45)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <IconCamera
                  size={22}
                  color="white"
                  style={{ cursor: 'pointer' }}
                  onClick={handleAvatarClick}
                />
                {user.avatar?.url && (
                  <IconTrash
                    size={22}
                    color="white"
                    style={{ cursor: 'pointer' }}
                    onClick={() => deleteAvatarMutation.mutate()}
                  />
                )}
              </Overlay>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Group>

        <Divider my="lg" />

        <Grid gutter="md" mb="lg">
          <Grid.Col span={4}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/reviews-page?type=user&id=${user.id}`)}
            >
              <Group>
                <IconMessage size={24} color="#FF8104" />
                <div>
                  <Text fw={700} size="xl">{user.stats.reviews}</Text>
                  <Text size="sm" c="dimmed">Отзывы</Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group>
                <IconStar size={24} color="#FF8104" />
                <div>
                  <Group gap={4}>
                    <Text fw={700} size="md">{user.ratingAsOwner.toFixed(1)}</Text>
                    <Text size="xs" c="dimmed">арендодатель</Text>
                  </Group>
                  <Group gap={4}>
                    <Text fw={700} size="md">{user.ratingAsRenter.toFixed(1)}</Text>
                    <Text size="xs" c="dimmed">арендатор</Text>
                  </Group>
                </div>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/my-products')}
            >
              <Group>
                <IconPackage size={24} color="#FF8104" />
                <div>
                  <Text fw={700} size="xl">{user.stats.offers ?? 0}</Text>
                  <Text size="sm" c="dimmed">Предложения</Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        <Paper shadow="sm" p="md" radius="md" mb="lg" withBorder>
          <Title order={3} mb="md">Персональная информация</Title>

          <Stack gap="sm">
            <Group>
              <Text fw={500} w={120}>Имя:</Text>
              <Text>{user.firstName || '—'}</Text>
            </Group>
            <Group>
              <Text fw={500} w={120}>Фамилия:</Text>
              <Text>{user.lastName || '—'}</Text>
            </Group>
            <Group>
              <Text fw={500} w={120}>Username:</Text>
              <Text>@{user.login}</Text>
            </Group>
            <Group>
              <Text fw={500} w={120}>Почта:</Text>
              <Text>{user.email}</Text>
            </Group>
            {user.phoneNumber && (
              <Group>
                <Text fw={500} w={120}>Телефон:</Text>
                <Text>{user.phoneNumber}</Text>
              </Group>
            )}
            {user.birthDate && (
              <Group>
                <Text fw={500} w={120}>Дата рождения:</Text>
                <Text>{formatDate(user.birthDate)}</Text>
              </Group>
            )}
            {user.gender && (
              <Group>
                <Text fw={500} w={120}>Пол:</Text>
                <Text>{formatGender(user.gender)}</Text>
              </Group>
            )}
            {user.language && (
              <Group>
                <Text fw={500} w={120}>Язык:</Text>
                <Text>{user.language === 'ru' ? 'Русский' : user.language === 'en' ? 'English' : user.language}</Text>
              </Group>
            )}
          </Stack>
        </Paper>

        <Group gap="sm">
          <Button
            variant="primary"
            leftSection={<IconEdit size={16} />}
            onClick={handleOpen}
            fullWidth
          >
            Редактировать
          </Button>
          <Button
            variant="secondary"
            leftSection={<IconLogout size={16} />}
            onClick={logout}
            fullWidth
          >
            Выйти
          </Button>
        </Group>
      </Container>

      <Modal opened={opened} onClose={close} title="Редактировать профиль" size="md">
        <Stack gap="md">
          <TextInput
            label="Имя"
            value={form.first_name}
            onChange={e => setForm(prev => ({ ...prev, first_name: e.currentTarget.value }))}
            placeholder="Введите имя"
          />
          <TextInput
            label="Фамилия"
            value={form.last_name}
            onChange={e => setForm(prev => ({ ...prev, last_name: e.currentTarget.value }))}
            placeholder="Введите фамилию"
          />
          <TextInput
            label="Телефон"
            value={form.phone}
            onChange={e => setForm(prev => ({ ...prev, phone: e.currentTarget.value }))}
            placeholder="+79001234567"
          />
          <TextInput
            label="Дата рождения"
            value={form.birth_date}
            onChange={e => setForm(prev => ({ ...prev, birth_date: e.currentTarget.value }))}
            placeholder="ГГГГ-ММ-ДД"
          />
          <Select
            label="Пол"
            value={form.gender || null}
            onChange={val => setForm(prev => ({ ...prev, gender: val ?? '' }))}
            data={GENDER_OPTIONS}
            placeholder="Выберите пол"
            clearable
          />
          <Group justify="flex-end">
            <Button variant="secondary" onClick={close}>Отмена</Button>
            <Button
              variant="primary"
              isLoading={updateMutation.isPending}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
