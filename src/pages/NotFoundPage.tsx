import { useNavigate } from 'react-router-dom';
import { Button, Flex, Text } from '@mantine/core';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Flex direction="column" align="center" justify="center" style={{ minHeight: '70vh' }} gap="md">
      <Text size="xl" fw={900} style={{ fontSize: 120, lineHeight: 1, color: '#FF8104' }}>
        404
      </Text>
      <Text size="xl" fw={600}>
        Страница не найдена
      </Text>
      <Text c="dimmed" ta="center" style={{ maxWidth: 400 }}>
        Запрошенная страница не существует или была удалена
      </Text>
      <Button
        mt="md"
        size="md"
        radius="md"
        bg="#FF8104"
        onClick={() => navigate('/')}
      >
        Вернуться на главную
      </Button>
    </Flex>
  );
};
