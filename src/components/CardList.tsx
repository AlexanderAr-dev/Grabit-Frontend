import { ICardPreview } from '@app-types';
import { SmallCard } from '@components/cards/SmallCard.tsx';
import { SimpleGrid } from '@mantine/core';

const mockData: ICardPreview[] = [
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
  {
    id: '1',
    title: 'Ремонт квартир',
    priceUnit: 'час',
    price: 500,
    category: {
      id: 1,
      name: 'Ремонт',
    },
    location: 'Р-н Советский',
    rating: 4,
    previewImage:
      'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    createdAt: '20/12/2025',
  },
];

export function CardList() {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3 }}
      spacing="lg"
    >
      {mockData.map((item, i) => (
        <SmallCard key={i} {...item} />
      ))}
    </SimpleGrid>
  );
}
