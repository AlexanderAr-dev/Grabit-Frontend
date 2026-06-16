import { FC, ReactNode } from 'react';
import { useAuth } from '@features/auth';
import {
  Button,
  Flex,
  LoadingOverlay,
  Text,
} from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = ({
  children,
}) => {
  const {
    isAuthenticated,
    isLoading,
    wasUnauthorized,
    login,
  } = useAuth();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: '70vh' }}
        gap="md"
      >
        <IconLock size={56} color="#FF8104" />
        <Text size="xl" fw={700}>
          {wasUnauthorized
            ? 'Вы вышли из аккаунта'
            : 'Требуется авторизация'}
        </Text>
        <Text
          c="dimmed"
          ta="center"
          style={{ maxWidth: 380 }}
        >
          {wasUnauthorized
            ? 'Сессия завершилась. Войдите снова, чтобы продолжить.'
            : 'Эта страница доступна только авторизованным пользователям.'}
        </Text>
        <Button
          mt="sm"
          size="md"
          radius="md"
          bg="#FF8104"
          onClick={login}
        >
          Войти
        </Button>
      </Flex>
    );
  }

  return <>{children}</>;
};
