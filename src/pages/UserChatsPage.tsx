import { ChatMessage } from '@components';
import { ChatList } from '@components/ChatList.tsx';

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    name: 'Thomas Selby',
    date: '11/10/2021',
    message: 'Понятно, спасибо за информацию!',
  },
  {
    id: '2',
    name: 'Thomas Selby',
    date: '11/10/2021',
    message: 'До свидания',
  },
  {
    id: '3',
    name: 'Thomas Selby C',
    date: '11/10/2021',
    message: 'У меня вопрос по услуге',
  },
  {
    id: '4',
    name: 'Thomas Selby B',
    date: '11/10/2021',
    message: 'Ремонт ноутбука',
  },
];

export const UserChatsPage = () => {
  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
      }}
    >
      <ChatList messages={mockMessages} />
    </div>
  );
};
