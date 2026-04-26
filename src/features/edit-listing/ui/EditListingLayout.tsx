import { ReactNode } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Text,
  Flex,
  useMantineColorScheme,
} from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';

import { mockRentAd } from '@entities/rental';

interface EditListingLayoutProps {
  children: ReactNode;
}

export const EditListingLayout = ({ children }: EditListingLayoutProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const numId = Number(id);
  const listing = mockRentAd.find(a => a.id === numId);
  const title = listing?.title ?? 'Объявление';

  const isCalendar = location.pathname.endsWith('/calendar');
  const infoPath = `/edit-listing/${id}`;
  const calendarPath = `/edit-listing/${id}/calendar`;

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    backgroundColor: active ? '#FF8104' : isDark ? '#2a2a2a' : '#f1f3f5',
    color: active ? '#fff' : isDark ? '#ccc' : '#555',
    border: 'none',
    fontSize: 14,
    transition: 'all 0.15s',
  });

  return (
    <Container size="sm" py="xl">
      {/* Назад */}
      <Flex
        align="center"
        gap={6}
        mb="md"
        style={{ cursor: 'pointer', width: 'fit-content' }}
        onClick={() => navigate('/my-products')}
      >
        <IconChevronLeft size={18} color="#FF8104" />
        <Text size="sm" c="#FF8104">Мои объявления</Text>
      </Flex>

      {/* Заголовок */}
      <Text fw={700} size="xl" mb="sm">Редактирование</Text>
      <Text c="dimmed" size="sm" mb="lg" style={{ lineHeight: 1.4 }}>
        {title}
      </Text>

      {/* Вкладки */}
      <Flex gap={8} mb="xl">
        <button style={tabStyle(!isCalendar)} onClick={() => navigate(infoPath)}>
          Информация
        </button>
        <button style={tabStyle(isCalendar)} onClick={() => navigate(calendarPath)}>
          Календарь
        </button>
      </Flex>

      {/* Контент */}
      <Box
        p="xl"
        style={{
          borderRadius: 16,
          border: `1px solid ${isDark ? '#333' : '#e9ecef'}`,
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
        }}
      >
        {children}
      </Box>
    </Container>
  );
};
