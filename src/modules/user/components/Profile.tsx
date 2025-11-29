import { useEffect, useState } from 'react';
import { IUser } from '@app-types';
import {
  ActionIcon,
  Avatar,
  Badge,
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
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconEdit,
  IconLogout,
  IconMessage,
  IconStar,
} from '@tabler/icons-react';
import { UserService } from '@api/services/userService';

export const Profile = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });

  // Загружаем данные пользователя из мока
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await UserService.infoUser();
        const userData = response.data.data;
        setUser(userData);
        setEditForm({
          name: userData.name,
          description: userData.description,
        });
      } catch (err) {
        setError('Ошибка загрузки данных пользователя');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name: editForm.name,
        description: editForm.description,
      });
      close();
    }
  };

  // Показываем загрузку
  if (loading) {
    return (
      <Container size="sm" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="lg" />
      </Container>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <Container size="sm" py="xl">
        <Text c="red" size="lg" ta="center">
          {error}
        </Text>
      </Container>
    );
  }

  // Если данные не загрузились
  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Text c="dimmed" size="lg" ta="center">
          Данные пользователя не найдены
        </Text>
      </Container>
    );
  }

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
            src={user.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80"}
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
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Group>

          <Stack gap="sm">
            <Group>
              <Text fw={500} w={80}>
                Логин:
              </Text>
              <Badge variant="light" color="blue">
                {user.login}
              </Badge>
            </Group>
            <Group>
              <Text fw={500} w={80}>
                Почта:
              </Text>
              <Badge variant="light" color="gray">
                {user.email}
              </Badge>
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
          >
            Выйти из аккаунта
          </Button>

          <Button
            variant="filled"
            leftSection={<IconMessage size={16} />}
            fullWidth
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