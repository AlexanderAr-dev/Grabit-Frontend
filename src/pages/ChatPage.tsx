import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ActionIcon,
  Card,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  name?: string;
}

interface Chat {
  id: string;
  name: string;
  preview: string;
  messages: Message[];
}

const cardTheme = {
  light: {
    primary: {
      backgroundColor: '#FDFDFD',
      text: '#000000',
      borderColor: '#E2E8F0',
      secondaryText: '#64748B',
    },
  },
  dark: {
    primary: {
      backgroundColor: '#2C3853',
      text: '#FFFFFF',
      borderColor: '#1E293B',
      secondaryText: '#94A3B8',
    },
  },
  auto: {
    primary: {
      backgroundColor: '#FDFDFD',
      text: '#000000',
      borderColor: '#E2E8F0',
      secondaryText: '#64748B',
    },
  },
};

// Моковые данные для 4 чатов
const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Thomas Selby',
    preview: 'Как состояние недвижимости?',
    messages: [
      {
        id: '1-1',
        text: 'Как состояние недвижимости?',
        sender: 'other',
        timestamp: '14:24',
        name: 'Thomas Selby',
      },
      {
        id: '1-2',
        text: 'Понятно, спасибо за информацию!',
        sender: 'user',
        timestamp: '14:30',
      },
    ],
  },
  {
    id: '2',
    name: 'Selby Thomas',
    preview: 'Это точно круто. Тебе понравится',
    messages: [
      {
        id: '2-1',
        text: 'Это точно круто. Тебе понравится',
        sender: 'other',
        timestamp: '14:25',
        name: 'Selby Thomas',
      },
      {
        id: '2-2',
        text: 'Спасибо, что связались со мной!',
        sender: 'user',
        timestamp: '14:31',
      },
      {
        id: '2-3',
        text: 'До свидания',
        sender: 'other',
        timestamp: '14:32',
        name: 'Selby Thomas',
      },
    ],
  },
  {
    id: '3',
    name: 'John Smith',
    preview: 'Привет, ты доступен?',
    messages: [
      {
        id: '3-1',
        text: 'Привет, ты доступен?',
        sender: 'other',
        timestamp: '14:26',
        name: 'John Smith',
      },
      {
        id: '3-2',
        text: 'Да, чем могу помочь?',
        sender: 'user',
        timestamp: '14:33',
      },
      {
        id: '3-3',
        text: 'У меня вопрос по услуге',
        sender: 'other',
        timestamp: '14:34',
        name: 'John Smith',
      },
    ],
  },
  {
    id: '4',
    name: 'Alice Johnson',
    preview: 'Спасибо за вашу помощь!',
    messages: [
      {
        id: '4-1',
        text: 'Спасибо за вашу помощь!',
        sender: 'other',
        timestamp: '14:27',
        name: 'Alice Johnson',
      },
      {
        id: '4-2',
        text: 'Пожалуйста!',
        sender: 'user',
        timestamp: '14:35',
      },
    ],
  },
];

const MessageBubble: FC<{ message: Message }> = ({
  message,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    cardTheme[colorScheme as keyof typeof cardTheme];
  const variantStyles = themeStyles.primary;

  const isUser = message.sender === 'user';

  return (
    <Group
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb="md"
    >
      <Stack gap={2} style={{ maxWidth: '70%' }}>
        {!isUser && message.name && (
          <Text
            size="sm"
            c={variantStyles.secondaryText}
            pl={8}
          >
            {message.name}
          </Text>
        )}
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: isUser
              ? colorScheme === 'dark'
                ? '#EA9432'
                : '#EA9432'
              : colorScheme === 'dark'
                ? '#373A40'
                : '#F1F3F5',
            color: isUser ? '#FFFFFF' : variantStyles.text,
          }}
        >
          <Text size="sm">{message.text}</Text>
        </Paper>
        <Text
          size="xs"
          c={variantStyles.secondaryText}
          ta={isUser ? 'right' : 'left'}
          pr={isUser ? 8 : 0}
          pl={isUser ? 0 : 8}
        >
          {message.timestamp}
        </Text>
      </Stack>
    </Group>
  );
};

export const ChatPage: FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    cardTheme[colorScheme as keyof typeof cardTheme];
  const variantStyles = themeStyles.primary;

  const [currentChat, setCurrentChat] =
    useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chat = mockChats.find(chat => chat.id === chatId);
    setCurrentChat(chat || null);
  }, [chatId]);

  useEffect(() => {
    // Автопрокрутка к последнему сообщению
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentChat?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChat) return;

    const newMessageObj: Message = {
      id: `${currentChat.id}-${currentChat.messages.length + 1}`,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessageObj],
    };

    setCurrentChat(updatedChat);
    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentChat) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor:
            colorScheme === 'dark' ? '#1A1B1E' : '#F5F5F5',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="xl" c={variantStyles.secondaryText}>
          Чат не найден
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
      }}
    >
      <Card
        radius="lg"
        style={{
          backgroundColor: variantStyles.backgroundColor,
          color: variantStyles.text,
          border: `1px solid ${variantStyles.borderColor}`,
          maxWidth: '800px',
          margin: '0 auto',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Заголовок чата */}
        <Card.Section
          p="md"
          style={{
            borderBottom: `1px solid ${variantStyles.borderColor}`,
            backgroundColor:
              colorScheme === 'dark'
                ? '#25262B'
                : '#F8F9FA',
          }}
        >
          <Text size="xl" fw={600} c={variantStyles.text}>
            {currentChat.name}
          </Text>
        </Card.Section>

        {/* Область сообщений */}
        <ScrollArea
          style={{ flex: 1, padding: '16px' }}
          viewportRef={viewport}
        >
          <Stack gap={0}>
            {currentChat.messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
          </Stack>
        </ScrollArea>

        {/* Поле ввода */}
        <Card.Section
          p="md"
          style={{
            borderTop: `1px solid ${variantStyles.borderColor}`,
            backgroundColor:
              colorScheme === 'dark'
                ? '#25262B'
                : '#F8F9FA',
          }}
        >
          <Group gap="sm">
            <TextInput
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={event =>
                setNewMessage(event.currentTarget.value)
              }
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              radius="md"
            />
            <ActionIcon
              size="lg"
              radius="md"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              variant="filled"
              color="blue"
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Card.Section>
      </Card>
    </div>
  );
};
