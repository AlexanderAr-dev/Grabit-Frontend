import { FC, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBan,
  IconBell,
  IconBellOff,
  IconCheck,
  IconChecks,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';

import { useAuth } from '@features/auth';
import { chatService } from '@shared/api';
import { componentsTheme } from '@shared/config';
import { ConversationResp, MessageResp, WsEvent } from '@shared/types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

const SystemMessage: FC<{ content: string; secondaryText: string }> = ({ content, secondaryText }) => (
  <Group justify="center" my="xs">
    <Text size="xs" c={secondaryText} ta="center" style={{ maxWidth: '80%' }}>
      {content}
    </Text>
  </Group>
);

const MessageBubble: FC<{
  message: MessageResp;
  isMine: boolean;
  variantStyles: { text: string; secondaryText: string; backgroundColor: string };
  isDark: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ message, isMine, variantStyles, isDark, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  if (message.message_type === 1) {
    return <SystemMessage content={message.content} secondaryText={variantStyles.secondaryText} />;
  }

  const bubbleBg = isMine ? '#FF8104' : isDark ? '#374151' : '#F1F3F5';
  const bubbleText = isMine ? '#FFFFFF' : variantStyles.text;
  const canAct = isMine && !message.is_deleted;

  return (
    <Group
      justify={isMine ? 'flex-end' : 'flex-start'}
      mb="xs"
      align="flex-end"
      gap={4}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {canAct && (
        <Menu shadow="md" position="top-end" withArrow onClose={() => setHovered(false)}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}
            >
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
              Редактировать
            </Menu.Item>
            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
              Удалить
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      <Stack gap={2} style={{ maxWidth: '72%' }}>
        <Paper p="sm" radius="lg" style={{ backgroundColor: bubbleBg, color: bubbleText }}>
          {message.is_deleted ? (
            <Text size="sm" fs="italic" c={isMine ? 'rgba(255,255,255,0.65)' : variantStyles.secondaryText}>
              Сообщение отозвано
            </Text>
          ) : (
            <Text size="sm" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Text>
          )}
        </Paper>
        <Group gap={4} justify={isMine ? 'flex-end' : 'flex-start'} align="center">
          <Text size="xs" c={variantStyles.secondaryText}>{formatTime(message.sent_at)}</Text>
          {message.is_edited && <Text size="xs" c={variantStyles.secondaryText}>ред.</Text>}
          {isMine && (
            message.read_at
              ? <IconChecks size={13} color="#FF8104" />
              : <IconCheck size={13} color={variantStyles.secondaryText} />
          )}
        </Group>
      </Stack>
    </Group>
  );
};

// Compact listing card shown above messages
const ListingCard: FC<{
  conversation: ConversationResp;
  variantStyles: { text: string; secondaryText: string; borderColor: string; backgroundColor: string };
  isDark: boolean;
  onNavigate: () => void;
}> = ({ conversation, variantStyles, isDark, onNavigate }) => (
  <UnstyledButton onClick={onNavigate} style={{ width: '100%', display: 'block', marginBottom: 8 }}>
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        border: `1px solid ${variantStyles.borderColor}`,
        borderRadius: 12,
        backgroundColor: isDark ? '#111827' : '#F9FAFB',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      <Image
        src={conversation.listing_cover_url || 'https://placehold.co/56x56?text=?'}
        w={56}
        h={56}
        radius="md"
        fit="cover"
        style={{ flexShrink: 0 }}
      />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={600} c={variantStyles.text} truncate style={{ flex: 1 }}>
            {conversation.listing_title}
          </Text>
          {conversation.listing_deleted && (
            <Badge size="xs" color="gray" variant="light" style={{ flexShrink: 0 }}>
              Удалено
            </Badge>
          )}
        </Group>
        <Text size="xs" c={variantStyles.secondaryText}>
          Перейти к объявлению
        </Text>
      </Stack>
      <IconExternalLink size={16} color={variantStyles.secondaryText} style={{ flexShrink: 0 }} />
    </Box>
  </UnstyledButton>
);

export const ChatPage: FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const variantStyles = componentsTheme.cardTheme[colorScheme].primary;
  const headerBg = isDark ? '#1F2937' : '#F8F9FA';

  // Prefer conversation from router state; fall back to fetching the list (e.g. direct URL access)
  const stateConversation = (location.state as { conversation?: ConversationResp } | null)?.conversation;
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', { page_size: 100 }],
    queryFn: () => chatService.getConversations({ page_size: 100 }),
    enabled: !stateConversation && !!chatId,
  });
  const conversation = stateConversation ?? conversationsData?.items.find(c => c.conversation_id === chatId);

  const [messages, setMessages] = useState<MessageResp[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [peerIsTyping, setPeerIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageResp | null>(null);

  const viewport = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const typingTimer = useRef<number | null>(null);
  const typingSentAt = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  // Sync mute/block state from conversation when it loads
  useEffect(() => {
    if (conversation) {
      setIsMuted(conversation.is_muted);
      setBlockedByMe(conversation.blocked_by_me);
    }
  }, [conversation?.conversation_id]);

  const { isLoading: messagesLoading, data: messagesData } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.getMessages(chatId!, { limit: 50 }),
    enabled: !!chatId,
  });

  const upsertMessage = (msg: MessageResp) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.message_id === msg.message_id);
      if (idx >= 0) return [...prev.slice(0, idx), { ...prev[idx], ...msg }, ...prev.slice(idx + 1)];
      return [...prev, msg];
    });
  };

  useEffect(() => {
    initializedRef.current = false;
    setMessages([]);
    setPeerIsTyping(false);
    setHasMore(false);
  }, [chatId]);

  useEffect(() => {
    if (!messagesData) return;
    const fresh = [...messagesData.items].reverse();
    if (!initializedRef.current) {
      initializedRef.current = true;
      setMessages(fresh);
    } else {
      setMessages(prev => {
        const byId = new Map<string, MessageResp>(prev.map(m => [m.message_id, m]));
        fresh.forEach(m => byId.set(m.message_id, { ...byId.get(m.message_id), ...m }));
        return Array.from(byId.values()).sort(
          (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
        );
      });
    }
    setHasMore(messagesData.has_more);
  }, [messagesData]);

  useEffect(() => {
    if (loadingMore) return;
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, peerIsTyping, loadingMore]);

  useEffect(() => {
    if (!chatId) return;
    const ws = new WebSocket(chatService.getChatWsUrl(chatId));
    wsRef.current = ws;
    ws.onmessage = event => {
      try {
        const wsEvent: WsEvent = JSON.parse(event.data);
        if (wsEvent.kind === 'message' || wsEvent.kind === 'system') {
          const msg = wsEvent.message;
          upsertMessage(msg);
          if (msg.sender_id !== userIdRef.current) {
            chatService.markAsRead(chatId, msg.message_id).catch(() => {});
          }
        }
        if (wsEvent.kind === 'typing' && wsEvent.message.sender_id !== userIdRef.current) {
          setPeerIsTyping(true);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = window.setTimeout(() => setPeerIsTyping(false), 3000);
        }
      } catch {}
    };
    return () => {
      wsRef.current = null;
      ws.close();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !messages.length) return;
    chatService.markAsRead(chatId, messages[messages.length - 1].message_id).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, !!messages.length]);

  const handleLoadMore = async () => {
    if (!chatId || !messages.length) return;
    setLoadingMore(true);
    try {
      const result = await chatService.getMessages(chatId, { limit: 50, before: messages[0].message_id });
      setMessages(prev => [...[...result.items].reverse(), ...prev]);
      setHasMore(result.has_more);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;
    const content = newMessage.trim();
    setNewMessage('');

    if (editingMessage) {
      const prev = editingMessage;
      setEditingMessage(null);
      try {
        const msg = await chatService.editMessage(chatId, prev.message_id, content);
        upsertMessage(msg);
      } catch {
        setNewMessage(content);
        setEditingMessage(prev);
      }
      return;
    }

    try {
      const msg = await chatService.sendMessage(chatId, content);
      upsertMessage(msg);
    } catch {
      setNewMessage(content);
    }
  };

  const handleStartEdit = (msg: MessageResp) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDelete = async (msg: MessageResp) => {
    if (!chatId) return;
    setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_deleted: true } : m));
    try {
      await chatService.deleteMessage(chatId, msg.message_id);
    } catch {
      setMessages(prev => prev.map(m => m.message_id === msg.message_id ? msg : m));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && editingMessage) { handleCancelEdit(); return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Throttle typing events — send at most once per 2s
  const sendTyping = () => {
    const now = Date.now();
    if (now - typingSentAt.current < 2000) return;
    typingSentAt.current = now;
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing' }));
    }
  };

  const otherUserId = user?.id === conversation?.renter_id
    ? conversation?.owner_id
    : conversation?.renter_id;

  const handleToggleMute = async () => {
    if (!chatId) return;
    const next = !isMuted;
    setIsMuted(next);
    try {
      if (next) await chatService.muteConversation(chatId);
      else await chatService.unmuteConversation(chatId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setIsMuted(!next);
    }
  };

  const handleToggleBlock = async () => {
    if (!otherUserId) return;
    const next = !blockedByMe;
    setBlockedByMe(next);
    try {
      if (next) await chatService.blockUser(otherUserId);
      else await chatService.unblockUser(otherUserId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setBlockedByMe(!next);
    }
  };

  return (
    <Box
      style={{
        height: isMobile
          ? 'calc(100dvh - var(--app-shell-header-height, 60px) - var(--app-shell-padding, 16px) * 2 - 60px)'
          : 'calc(100dvh - var(--app-shell-header-height, 60px) - var(--app-shell-padding, 16px) * 2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Listing card — отдельный блок над чатом ── */}
      {conversation && (
        <ListingCard
          conversation={conversation}
          variantStyles={variantStyles}
          isDark={isDark}
          onNavigate={() => navigate(`/rent-page/${conversation.listing_id}`)}
        />
      )}

      {/* ── Chat panel ── */}
      <Box
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          border: `1px solid ${variantStyles.borderColor}`,
          backgroundColor: variantStyles.backgroundColor,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            backgroundColor: headerBg,
            borderBottom: `1px solid ${variantStyles.borderColor}`,
            padding: '12px 16px',
            flexShrink: 0,
          }}
        >
          <Group gap="sm" wrap="nowrap" justify="space-between">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <ActionIcon variant="subtle" size="lg" color="gray" onClick={() => navigate('/chats')}>
                <IconArrowLeft size={20} />
              </ActionIcon>
              {conversation ? (
                <>
                  <Avatar
                    src={conversation.other_avatar_url || null}
                    radius="xl"
                    size={40}
                    color="orange"
                    style={{ flexShrink: 0 }}
                  >
                    {conversation.other_username[0]?.toUpperCase()}
                  </Avatar>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text size="md" fw={600} c={variantStyles.text} truncate>
                      {conversation.other_username}
                    </Text>
                    {blockedByMe && (
                      <Text size="xs" c="red">Заблокирован</Text>
                    )}
                  </Stack>
                </>
              ) : (
                <Text size="md" fw={600} c={variantStyles.text}>Чат</Text>
              )}
            </Group>
            {conversation && (
              <Menu shadow="md" position="bottom-end" withArrow>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg" color="gray">
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={isMuted ? <IconBell size={16} /> : <IconBellOff size={16} />}
                    onClick={handleToggleMute}
                  >
                    {isMuted ? 'Включить уведомления' : 'Заглушить уведомления'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color={blockedByMe ? 'orange' : 'red'}
                    leftSection={<IconBan size={16} />}
                    onClick={handleToggleBlock}
                  >
                    {blockedByMe ? 'Разблокировать' : 'Заблокировать'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Box>

        {/* Messages — flex:1 so it fills remaining height; overflowY:auto for scroll */}
        <Box
          ref={viewport}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messagesLoading ? (
            <Group justify="center" align="center" style={{ flex: 1 }}>
              <Loader color="orange" size="md" />
            </Group>
          ) : (
            <Stack
              gap={0}
              p="md"
              style={{
                flex: 1,
                justifyContent: 'flex-end',
              }}
            >
              {hasMore && (
                <Group justify="center" mb="md">
                  <Button variant="subtle" color="gray" size="xs" loading={loadingMore} onClick={handleLoadMore}>
                    Загрузить ещё
                  </Button>
                </Group>
              )}
              {messages.map(msg => (
                <MessageBubble
                  key={msg.message_id}
                  message={msg}
                  isMine={msg.sender_id === user?.id}
                  variantStyles={variantStyles}
                  isDark={isDark}
                  onEdit={() => handleStartEdit(msg)}
                  onDelete={() => handleDelete(msg)}
                />
              ))}
              {peerIsTyping && (
                <Group justify="flex-start" mb="xs">
                  <Paper p="sm" radius="lg" style={{ backgroundColor: isDark ? '#374151' : '#F1F3F5' }}>
                    <Text size="sm" c={variantStyles.secondaryText}>печатает...</Text>
                  </Paper>
                </Group>
              )}
            </Stack>
          )}
        </Box>

        {/* Input */}
        <Box
          style={{
            backgroundColor: headerBg,
            borderTop: `1px solid ${variantStyles.borderColor}`,
            padding: conversation?.blocked_by_them || blockedByMe ? '10px 16px' : '12px 16px',
            flexShrink: 0,
          }}
        >
          {conversation?.blocked_by_them ? (
            <Text size="sm" c="dimmed" ta="center">
              Вы не можете отправлять сообщения этому пользователю
            </Text>
          ) : blockedByMe ? (
            <Text size="sm" c="dimmed" ta="center">
              Вы заблокировали этого пользователя
            </Text>
          ) : (
            <Stack gap="xs">
              {editingMessage && (
                <Group gap="xs" align="center" style={{ padding: '4px 8px', borderRadius: 8, backgroundColor: isDark ? '#374151' : '#E9ECEF' }}>
                  <IconEdit size={14} color="#FF8104" />
                  <Text size="xs" c={variantStyles.secondaryText} style={{ flex: 1 }} truncate>
                    Редактирование: {editingMessage.content}
                  </Text>
                  <ActionIcon variant="subtle" size="xs" color="gray" onClick={handleCancelEdit}>
                    ✕
                  </ActionIcon>
                </Group>
              )}
              <Group gap="sm" align="flex-end">
                <Textarea
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={e => { setNewMessage(e.currentTarget.value); sendTyping(); }}
                  onKeyDown={handleKeyDown}
                  autosize
                  minRows={1}
                  maxRows={5}
                  style={{ flex: 1 }}
                  radius="xl"
                  styles={{
                    input: {
                      backgroundColor: isDark ? '#374151' : '#F1F3F5',
                      border: 'none',
                      color: variantStyles.text,
                      resize: 'none',
                    },
                  }}
                />
                <ActionIcon
                  size="lg"
                  radius="xl"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  style={{ backgroundColor: newMessage.trim() ? '#FF8104' : undefined }}
                >
                  <IconSend size={18} color={newMessage.trim() ? '#FFFFFF' : undefined} />
                </ActionIcon>
              </Group>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};
