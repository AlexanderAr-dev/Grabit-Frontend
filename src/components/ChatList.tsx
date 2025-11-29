import { FC } from 'react';
import { ScrollArea, Stack } from '@mantine/core';

import { ChatItem, ChatMessage } from './ChatItem';

interface ChatListProps {
  messages: ChatMessage[];
}

export const ChatList: FC<ChatListProps> = ({
  messages,
}) => {
  return (
    <div>
      <Stack gap="lg">
        <ScrollArea style={{ height: '600px' }}>
          <Stack gap="md">
            {messages.map((message, index) => (
              <ChatItem
                chatId={message.id}
                key={message.id}
                message={message}
                index={index}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </div>
  );
};
