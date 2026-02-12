import {
  Box,
  Card,
  CardSection,
  Center,
  Flex,
  Group,
  Image,
  Rating,
  SimpleGrid,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconMapPin,
  IconMessageCircle,
  IconMessageFilled,
  IconStarFilled,
} from '@tabler/icons-react';
import { Button } from '@ui';

export const RentPage = () => {
  return (
    <>
      <Flex
        mih={50}
        gap="xl"
        justify="center"
        align="center"
        direction="row"
        style={{
          border: '1px solid gray',
          borderRadius: '10px',
        }}
      >
        <Image
          src={
            'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200'
          }
          h={405}
          w={400}
          bdrs={10}
        />
        <Card
          padding="lg"
          radius="md"
          style={{
            maxWidth: 400,
            fontFamily: 'sans-serif',
          }}
          bdrs={10}
        >
          {/* Дата */}
          <Text size="sm" c="dimmed" mb="md">
            20/12/2025
          </Text>

          {/* Заголовок */}
          <Text fw={700} size="xl" mb="lg">
            Ремонт квартир
          </Text>

          <Group justify="space-between" mb="md">
            {/* Цены */}
            <Box>
              <Text fw={600} size="md" mb={4}>
                Цена
              </Text>
              <Text size="sm">{800} р/ч</Text>
              <Text size="sm">{800} р/день</Text>
              <Text size="sm">{800} р/неделя</Text>
            </Box>

            {/* Оценка */}
            <Box style={{ textAlign: 'right' }}>
              <Text fw={600} size="md" mb={4}>
                Оценка
              </Text>
              <Group gap={4} justify="flex-end" mb={2}>
                <Rating
                  value={4.5}
                  fractions={2}
                  readOnly
                  size="sm"
                />
                <Text size="sm" fw={500}>
                  {(4.5).toFixed(1)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                ({12})
              </Text>
              {/* Звезды для отображения */}
              <Group gap={2} mt={4} justify="flex-end">
                {[...Array(5)].map((_, i) => (
                  <Text
                    key={i}
                    size="sm"
                    c={
                      i < Math.floor(4.5)
                        ? '#ffd700'
                        : 'gray'
                    }
                  >
                    ★
                  </Text>
                ))}
              </Group>
            </Box>
          </Group>

          {/* Адрес */}
          <Box mb="lg">
            <Group gap={6} mb={4}>
              <IconMapPin
                size={16}
                style={{ color: 'gray' }}
              />
              <Text fw={600} size="md">
                Адрес
              </Text>
            </Group>
            <Text
              size="sm"
              c="dimmed"
              style={{ lineHeight: 1.3 }}
            >
              Красноярский край, г. Красноярск, Р-н
              Советский, ул. Краснодарская, 406
            </Text>
          </Box>

          {/* Имя и рейтинг исполнителя */}
          <Group justify="space-between" mb="5">
            <Flex direction={'column'}>
              <Text fw={600} size="md">
                Thomas Selby
              </Text>
              <Group gap={'lg'} >
                <Text size="sm" fw={500}>
                  {4.2} (142)
                </Text>
                <Group gap={2}>
                  {[...Array(5)].map((_, i) => (
                    <Text
                      key={i}
                      size="sm"
                      c={i < 4 ? '#ffd700' : 'gray'}
                    >
                      ★
                    </Text>
                  ))}
                </Group>
              </Group>
            </Flex>

            <Image
              w={50}
              h={50}
              src={
                'https://i.pinimg.com/236x/59/fe/e8/59fee8d585ce597b3878d7be5e83beea.jpg?nii=t'
              }
            />
          </Group>

          {/* Кнопка "Написать" */}
          <Button
            fullWidth
            variant="primary"
            leftSection={<IconMessageCircle size={18} />}
            radius="md"
          >
            Написать
          </Button>
        </Card>
      </Flex>
      <Flex mb={30}>
        <Box w={400} mt={15} mr={40}>
          <Text size={'xl'}>Описание</Text>
          <Text>
            Ремонт под ключ с гарантией качества: быстро,
            аккуратно и по доступной цене. Восстанавливаем
            работоспособность техники, мебели и интерьера,
            чтобы всё служило вам долго и выглядело как
            новое.
          </Text>
        </Box>
        <Box w={400} mt={15}>
          <Text size={'xl'}>Харакатеристки</Text>
          <Text>
            10 насадок 8 млн мощи встроенный радиоприемник
          </Text>
        </Box>
      </Flex>
      <Box mb={30}>
        <Text size={'xl'}>Объявления на карте</Text>
        <Text size={'sm'}>
          Красноярский край, г. Красноярск, Р-н Советский,
          ул. Краснодарская, 40б
        </Text>
        <Image
          src={
            'https://articles-assets.akvarto.ru/storage/images/все-районы-Красноярска.jpg'
          }
        />
      </Box>
      <Box mb={30}>
        <Text size={'xl'}>Календарь бронирования</Text>
      </Box>
    </>

    // <Card radius="md" bg={'white'}>
    //   <Image
    //     bdrs={'lg'}
    //     src={
    //       'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200'
    //     }
    //   />
    //   <h1>Ремонт квартир</h1>
    //   <Box bdrs={'md'} bg={'#F8F8F9'} p={'xs'} mb={20}>
    //     <Text size={'xl'}>Цена</Text>
    //     <Text size={'sm'}>800р/час</Text>
    //   </Box>
    //   <SimpleGrid
    //     cols={2}
    //     spacing="xs"
    //     verticalSpacing="xs"
    //     bdrs={'md'}
    //     bg={'white'}
    //     p={'xs'}
    //     mb={20}
    //   >
    //     <Box>
    //       <Text size={'xl'}>Thomas Shelby</Text>
    //       <Flex gap={'lg'} direction={'row'}>
    //         <Text size={'sm'}>4.2 (142)</Text>
    //         <Flex
    //           gap={'xs'}
    //           direction={'row'}
    //           align={'center'}
    //         >
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} />
    //         </Flex>
    //       </Flex>
    //     </Box>
    //     <Group justify={'flex-end'}>
    //       <Image
    //         radius={'md'}
    //         h={60}
    //         w="auto"
    //         src={
    //           'https://i.pinimg.com/originals/a5/0f/f5/a50ff52422d46cadf3292534afd447fc.jpg'
    //         }
    //       />
    //     </Group>
    //   </SimpleGrid>
    //   <Box bdrs={'md'} bg={'#F8F8F9'} p={'xs'} mb={20}>
    //     <Text size={'xl'}>Оценка</Text>
    //     <Box>
    //       <Flex gap={'lg'} direction={'row'}>
    //         <Text size={'sm'}>4.5 (12)</Text>
    //         <Flex
    //           gap={'xs'}
    //           direction={'row'}
    //           align={'center'}
    //         >
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} color={'yellow'} />
    //           <IconStarFilled size={15} />
    //         </Flex>
    //       </Flex>
    //     </Box>
    //   </Box>
    //   <Center>
    //     <Button
    //       mb={20}
    //       h={50}
    //       w={300}
    //       justify={'center'}
    //       style={{ border: '1px solid black' }}
    //       radius={'md'}
    //     >
    //       <Text size={'xl'} pr={10}>
    //         Написать
    //       </Text>
    //       <IconMessageFilled />
    //     </Button>
    //   </Center>
    //
    //   <Box bdrs={'md'} bg={'#F8F8F9'} p={'xs'} mb={20}>
    //     <Text size={'xl'}>Адрес</Text>
    //     <Text size={'sm'}>Красноярский край, г. Красноярск, Р-н Советский, ул. Краснодарская, 40б</Text>
    //   </Box>
    //
    // </Card>
  );
};
