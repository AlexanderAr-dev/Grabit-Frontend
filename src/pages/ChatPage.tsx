import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserCard, IMediaType } from '@shared/types';
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
  date: string;
  isRead: boolean;
  isReceive: boolean;
  userId: number;
  media: IMediaType[];
}

interface Chat {
  id: string;
  talker: UserCard;
  adName: string;
  lastMessageDate: string;
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

const mockChats: Chat[] = [
  {
    id: '1',
    talker: { id: 1, name: 'Thomas Selby' },
    adName: 'Квартира в центре',
    lastMessageDate: '11/10/2021',
    messages: [
      { id: '1-1', text: 'Здравствуйте! Интересует аренда.', date: '10:00', isRead: true, isReceive: true, userId: 1, media: [] },
      { id: '1-2', text: 'Добрый день, чем могу помочь?', date: '10:01', isRead: true, isReceive: false, userId: 2, media: [] },
    ],
  },
  {
    id: '2',
    talker: { id: 2, name: 'Anna Smith' },
    adName: 'Офис на Тверской',
    lastMessageDate: '11/10/2021',
    messages: [
      { id: '2-1', text: 'Есть ли свободные даты?', date: '09:30', isRead: true, isReceive: true, userId: 2, media: [] },
    ],
  },
];

const MessageBubble: FC<{ message: Message; talkerName: string }> = ({
  message,
  talkerName,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const themeStyles =
    cardTheme[colorScheme as keyof typeof cardTheme];
  const variantStyles = themeStyles.primary;

  const isUser = !message.isReceive;

  return (
    <Group
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb="md"
    >
      <Stack gap={2} style={{ maxWidth: '70%' }}>
        {!isUser && (
          <Text
            size="sm"
            c={variantStyles.secondaryText}
            pl={8}
          >
            {talkerName}
          </Text>
        )}
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: isUser
              ? '#EA9432'
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
          {message.date}
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
      date: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
      isReceive: false,
      userId: 0,
      media: [],
    };

    setCurrentChat({
      ...currentChat,
      messages: [...currentChat.messages, newMessageObj],
    });
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
            {currentChat.adName}
          </Text>
        </Card.Section>

        <ScrollArea
          style={{ flex: 1, padding: '16px' }}
          viewportRef={viewport}
        >
          <Stack gap={0}>
            {currentChat.messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                talkerName={currentChat.talker.name}
              />
            ))}
          </Stack>
        </ScrollArea>

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
