import { FC, useState } from 'react';
import { RentalCard } from '@components/cards/RentalCard';
import {
  Collapse,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';

export const RentalsPage: FC = () => {
  const [currentOpen, setCurrentOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  const handleWriteMessage = (phone: string) => {
    console.log('Написать сообщение:', phone);
    // Навигация к чату
  };

  const currentRentals = [
    {
      id: '1',
      phone: '+8 999 999 99 99',
      service: 'Ремонт ноутбука',
      timeLeft: '2,5 часа',
      previewImage:
        'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    },
    {
      id: '2',
      phone: '+8 888 888 88 88',
      service: 'Ремонт кофемашины',
      timeLeft: '1 час',
      previewImage:
        'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    },
  ];

  const completedRentals = [
    {
      id: '3',
      phone: '+8 777 777 77 77',
      service: 'Ремонт ноутбука',
      previewImage:
        'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    },
    {
      id: '4',
      phone: '+8 666 666 66 66',
      service: 'Ремонт компьютера',
      previewImage:
        'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    },
  ];

  const SectionHeader: FC<{
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    count: number;
  }> = ({ title, isOpen, onToggle, count }) => (
    <UnstyledButton
      onClick={onToggle}
      style={{
        width: '100%',
        marginBottom: '16px',
      }}
    >
      <Group justify="space-between">
        <Text
          size="28px"
          fw={800}
          c="#FF8104"
          style={{
            fontSize: '28px',
            fontWeight: 800,
          }}
        >
          {title} ({count})
        </Text>
        {isOpen ? (
          <IconChevronUp size={28} color="#FF8104" />
        ) : (
          <IconChevronDown size={28} color="#FF8104" />
        )}
      </Group>
    </UnstyledButton>
  );

  return (
    <div
      style={{
        padding: '40px',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Stack gap="xl">
          {/* Текущие аренды */}
          <div>
            <SectionHeader
              title="Текущие"
              isOpen={currentOpen}
              onToggle={() => setCurrentOpen(!currentOpen)}
              count={currentRentals.length}
            />

            <Collapse in={currentOpen}>
              <Stack gap="md">
                {currentRentals.map(rental => (
                  <RentalCard
                    key={rental.id}
                    phone={rental.phone}
                    service={rental.service}
                    status="current"
                    timeLeft={rental.timeLeft}
                    previewImage={rental.previewImage}
                    onClick={() =>
                      handleWriteMessage(rental.phone)
                    }
                  />
                ))}
              </Stack>
            </Collapse>
          </div>

          {/* Завершенные аренды */}
          <div>
            <SectionHeader
              title="Завершенные"
              isOpen={completedOpen}
              onToggle={() =>
                setCompletedOpen(!completedOpen)
              }
              count={completedRentals.length}
            />

            <Collapse in={completedOpen}>
              <Stack gap="md">
                {completedRentals.map(rental => (
                  <RentalCard
                    key={rental.id}
                    phone={rental.phone}
                    service={rental.service}
                    status="completed"
                    previewImage={rental.previewImage}
                    onClick={() =>
                      handleWriteMessage(rental.phone)
                    }
                  />
                ))}
              </Stack>
            </Collapse>
          </div>
        </Stack>
      </div>
    </div>
  );
};
