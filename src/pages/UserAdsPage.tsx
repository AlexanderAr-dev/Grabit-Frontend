import { FC } from 'react';
import { ICardPreview } from '@app-types';
import { MediumCard, SearchInput } from '@components';
import { Container, Flex, SimpleGrid } from '@mantine/core';
import { Button } from '@ui';

const mockCards: ICardPreview[] = [
  {
    id: '1',
    title: 'Ремонт',
    price: 800,
    priceUnit: 'час',
    location: 'Р-н Советский',
    rating: 4.5,
    reviewCount: 142,
    shortDescription:
      'Ремонт под ключ с гарантией качества: быстро, аккуратно и по доступной цене. Восстанавливаем работоспособность техники, мебели и интерьера, чтобы всё служило вам долго и выглядело как новое.',
    createdAt: 'Отз.: 142',
    category: { id: 1, name: 'services' },
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
  },
  {
    id: '2',
    title: 'Уборка помещений',
    price: 600,
    priceUnit: 'час',
    location: 'Р-н Центральный',
    rating: 4.2,
    reviewCount: 89,
    shortDescription:
      'Профессиональная уборка офисов и квартир с использованием современной техники и экологичных средств.',
    createdAt: '2 часа назад',
    category: { id: 2, name: 'services' },
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
  },
];

export const UserAdsPage: FC = () => {
  return (
    <Container size="xl" py="xl">
      <Flex
        gap="md"
        justify="center"
        align="center"
        direction="row"
        pb={20}
      >
        <SearchInput />
        <Button radius={'lg'} w={180} h={40}>
          Новое объявление
        </Button>
      </Flex>

      <SimpleGrid cols={{ base: 1, lg: 1 }} spacing="lg">
        {mockCards.map(card => (
          <MediumCard
            key={card.id}
            variant="primary"
            {...card}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};
