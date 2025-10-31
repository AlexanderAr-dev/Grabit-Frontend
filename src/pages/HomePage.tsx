import { CardList } from '@components/cardList.tsx';
import {
  Button,
  Flex,
  Group,
  Select,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export const HomePage = () => {
  return (
    <>
      <Flex
        gap="md"
        justify="center"
        align="center"
        direction="column"
      >
        <TextInput
          rightSection={<IconSearch size={18} />}
          c={'black'}
          placeholder="Поиск вещи/помещения/услуги"
          radius="xl"
          size="lg"
          w={600}
        />
        <Group
          align="center"
          gap="md"
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          <Select
            data={[
              'Дата',
              'Дешевле',
              'Дороже',
              'Популярное',
            ]}
            placeholder="Отсортировать"
            radius={'lg'}
            styles={{
              input: {
                backgroundColor: '#FF8104',
                color: 'white',
                border: 'none',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.8)',
                },
              },
              dropdown: {
                backgroundColor: '#1E293B',
                color: 'white',
              },
            }}
          />
          <Button radius={'lg'} bg={'#FF8104'}>
            Вещи
          </Button>
          <Button radius={'lg'} bg={'#667291'}>
            Услуги
          </Button>
          <Button radius={'lg'} bg={'#667291'}>
            Помещения
          </Button>
        </Group>
      </Flex>
      <div
        style={{
          padding: 20,
          minHeight: '100vh',
        }}
      >
        <CardList />
      </div>
    </>
  );
};
