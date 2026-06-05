import { FC } from 'react';
import { Stack } from '@mantine/core';

import { ConversationResp } from '@shared/types';

import { ChatItem } from './ChatItem';

interface ChatListProps {
  conversations: ConversationResp[];
}

export const ChatList: FC<ChatListProps> = ({ conversations }) => {
  return (
    <Stack gap="xs">
      {conversations.map(conv => (
        <ChatItem key={conv.conversation_id} conversation={conv} />
      ))}
    </Stack>
  );
};
