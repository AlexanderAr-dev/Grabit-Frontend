import { FC } from 'react';
import { Avatar, Badge, Card, Group, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconBan, IconBellOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { componentsTheme } from '@shared/config';
import { ConversationResp } from '@shared/types';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
}

interface ChatItemProps {
  conversation: ConversationResp;
}

export const ChatItem: FC<ChatItemProps> = ({ conversation }) => {
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const variantStyles = componentsTheme.cardTheme[colorScheme].primary;

  const lastMsgText = conversation.last_message
    ? conversation.last_message.is_deleted
      ? 'Сообщение отозвано'
      : conversation.last_message.content.length > 60
        ? conversation.last_message.content.slice(0, 60) + '...'
        : conversation.last_message.content
    : 'Нет сообщений';

  return (
    <Card
      shadow="sm"
      radius="md"
      withBorder
      style={{
        backgroundColor: variantStyles.backgroundColor,
        borderColor: variantStyles.borderColor,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onClick={() => navigate(`/chats/${conversation.conversation_id}`, { state: { conversation } })}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <Group wrap="nowrap" align="flex-start">
        <Avatar
          src={conversation.other_avatar_url || null}
          radius="xl"
          size={48}
          color="orange"
          style={{ flexShrink: 0 }}
        >
          {conversation.other_username[0]?.toUpperCase()}
        </Avatar>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <Text size="md" fw={600} c={variantStyles.text} truncate>
                {conversation.other_username}
              </Text>
              {conversation.blocked_by_me && (
                <IconBan size={14} color="#fa5252" style={{ flexShrink: 0 }} />
              )}
              {conversation.is_muted && (
                <IconBellOff size={14} color={variantStyles.secondaryText} style={{ flexShrink: 0 }} />
              )}
            </Group>
            <Text size="xs" c={variantStyles.secondaryText} style={{ flexShrink: 0 }}>
              {formatDate(conversation.last_message_at)}
            </Text>
          </Group>

          <Text size="xs" c={variantStyles.secondaryText} truncate>
            {conversation.listing_title}
          </Text>

          <Group justify="space-between" wrap="nowrap" mt={2}>
            <Text size="sm" c={variantStyles.secondaryText} truncate style={{ flex: 1 }}>
              {lastMsgText}
            </Text>
            {conversation.unread_count > 0 && (
              <Badge color="orange" size="sm" circle style={{ flexShrink: 0 }}>
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
