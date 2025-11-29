import { FC } from 'react';
import { componentsTheme } from '@constants';
import {
  Card,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export interface ChatMessage {
  id: string;
  name: string;
  date: string;
  message: string;
}

interface ChatItemProps {
  message: ChatMessage;
  index: number;
  chatId: string;
}

export const ChatItem: FC<ChatItemProps> = ({
  message,
  index,
  chatId,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    componentsTheme.cardTheme[colorScheme];
  const variantStyles = themeStyles.primary;
  const navigate = useNavigate();

  const backgroundColor =
    index % 2 === 0
      ? variantStyles.backgroundColor
      : colorScheme === 'dark'
        ? '#1E293B'
        : '#F8FAFC';

  return (
    <Card
      onClick={() => navigate(`/chats/${chatId}`)}
      shadow="sm"
      radius="md"
      withBorder
      style={{
        backgroundColor,
        color: variantStyles.text,
        borderColor: variantStyles.borderColor,
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between">
            <Text size="lg" fw={600} c={variantStyles.text}>
              {message.name}
            </Text>
            <Text size="sm" c={variantStyles.secondaryText}>
              {message.date}
            </Text>
          </Group>

          <Text
            size="md"
            c={variantStyles.text}
            style={{ lineHeight: 1.4 }}
          >
            {message.message}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};
