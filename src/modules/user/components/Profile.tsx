import { useState } from 'react';
import { IUserInfo } from '@app-types';
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconEdit,
  IconLogout,
  IconMessage,
  IconStar,
} from '@tabler/icons-react';

// Предзаписанные данные пользователя
const MOCK_USER_DATA: IUserInfo = {
  id: 1,
  email: 'test@example.com',
  login: 'testuser',
  isVerified: false,
  language: 'ru',
  avatar: {
    id: 1,
    url: 'https://reqres.in/img/faces/1-image.jpg',
  },
  phoneNumber: '89130000000',
  name: 'Тестовый Пользователь',
  description: 'Это тестовый пользователь для демонстрации',
  stats: {
    reviews: 15,
    rating: 4.8,
    offers: 7,
  },
};

export const Profile = () => {
  // Используем предзаписанные данные
  const [user, setUser] =
    useState<IUserInfo>(MOCK_USER_DATA);
  const [opened, { open, close }] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    name: MOCK_USER_DATA.name,
    description: MOCK_USER_DATA.description || '',
  });

  const handleSave = () => {
    // Обновляем данные пользователя
    setUser({
      ...user,
      name: editForm.name,
      description: editForm.description,
    });
    close();
  };

  // Функция для выхода из аккаунта
  const handleLogout = () => {
    // Здесь должна быть логика выхода
    console.log('Выход из аккаунта');
    // Например, очистка токена, редирект на главную и т.д.
  };

  // Функция для просмотра отзывов
  const handleViewReviews = () => {
    // Здесь должна быть логика перехода к отзывам
    console.log('Переход к отзывам');
    // Например, навигация на страницу отзывов
  };

  return (
    <>
      <Container size="sm" py="xl">
        {/* Заголовок профиля */}
        <Group
          justify="space-between"
          mb="lg"
          wrap="nowrap"
          align="flex-start"
        >
          <div style={{ flex: 1 }}>
            <Title order={1}>{user.name}</Title>
            <Text
              c="dimmed"
              size="lg"
              style={{ whiteSpace: 'pre-line' }}
            >
              {user.description}
            </Text>
          </div>
          <Avatar
            size={120}
            radius="md"
            src={
              user.avatar?.url ||
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80'
            }
            alt={user.name}
          />
        </Group>

        <Divider my="lg" />

        {/* Статистика */}
        <Grid gutter="md" mb="lg">
          <Grid.Col span={4}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
            >
              <Group>
                <IconMessage size={24} />
                <div>
                  <Text fw={700} size="xl">
                    {user.stats.reviews}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Отзывы
                  </Text>
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
            >
              <Group>
                <IconStar size={24} />
                <div>
                  <Text fw={700} size="xl">
                    {user.stats.rating}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Рейтинг
                  </Text>
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
            >
              <Group>
                <IconMessage size={24} />
                <div>
                  <Text fw={700} size="xl">
                    {user.stats.offers}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Предложения
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        {/* Персональная информация */}
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          mb="lg"
          withBorder
        >
          <Group justify="space-between" mb="md">
            <Title order={3}>Персональная информация</Title>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={open}
              aria-label="Редактировать профиль"
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Group>

          <Stack gap="sm">
            <Group>
              <Text fw={500} w={80}>
                Логин:
              </Text>
              <Text>{user.login}</Text>
            </Group>
            <Group>
              <Text fw={500} w={80}>
                Почта:
              </Text>
              <Text>{user.email}</Text>
            </Group>
            {user.phoneNumber && (
              <Group>
                <Text fw={500} w={80}>
                  Телефон:
                </Text>
                <Text>{user.phoneNumber}</Text>
              </Group>
            )}
            <Group>
              <Text fw={500} w={80}>
                Статус:
              </Text>
              <Text>
                {user.isVerified
                  ? 'Подтвержден'
                  : 'Не подтвержден'}
              </Text>
            </Group>
            <Group>
              <Text fw={500} w={80}>
                Язык:
              </Text>
              <Text>
                {user.language === 'ru'
                  ? 'Русский'
                  : user.language}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* Кнопки действий */}
        <Stack gap="sm">
          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size={16} />}
            fullWidth
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </Button>

          <Button
            variant="filled"
            leftSection={<IconMessage size={16} />}
            fullWidth
            onClick={handleViewReviews}
          >
            Посмотреть отзывы
          </Button>
        </Stack>
      </Container>

      {/* Модальное окно редактирования */}
      <Modal
        opened={opened}
        onClose={close}
        title="Редактировать профиль"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Имя"
            value={editForm.name}
            onChange={e =>
              setEditForm({
                ...editForm,
                name: e.target.value,
              })
            }
            placeholder="Введите ваше имя"
          />
          <TextInput
            label="Описание"
            value={editForm.description}
            onChange={e =>
              setEditForm({
                ...editForm,
                description: e.target.value,
              })
            }
            placeholder="Расскажите о себе"
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
