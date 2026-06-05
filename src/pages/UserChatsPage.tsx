import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Group, Loader, Skeleton, Stack, Text, useMantineColorScheme } from '@mantine/core';

import { chatService } from '@shared/api';
import { componentsTheme } from '@shared/config';
import { ChatList } from '@widgets/chat-list';

const PAGE_SIZE = 20;

export const UserChatsPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const variantStyles = componentsTheme.cardTheme[colorScheme].primary;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['conversations', { page_size: PAGE_SIZE }],
    queryFn: ({ pageParam = 1 }) => chatService.getConversations({ page: pageParam, page_size: PAGE_SIZE }),
    getNextPageParam: (lastPage, _, lastParam) => lastPage.has_more ? (lastParam as number) + 1 : undefined,
    initialPageParam: 1,
  });

  const conversations = data?.pages.flatMap(p => p.items) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div style={{ paddingBottom: 8 }}>
      <Text size="xl" fw={700} c={variantStyles.text} mb="lg">
        Сообщения
      </Text>

      {isLoading && (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={80} radius="md" />
          ))}
        </Stack>
      )}

      {!isLoading && !conversations.length && (
        <Group justify="center" py="xl">
          <Stack align="center" gap="xs">
            <Text size="lg" c={variantStyles.secondaryText}>Нет диалогов</Text>
            <Text size="sm" c={variantStyles.secondaryText} ta="center">
              Начните переписку с арендодателем на странице объявления
            </Text>
          </Stack>
        </Group>
      )}

      {!isLoading && !!conversations.length && (
        <ChatList conversations={conversations} />
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && (
        <Group justify="center" py="sm">
          <Loader color="orange" size="sm" />
        </Group>
      )}
    </div>
  );
};
