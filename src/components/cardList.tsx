import { SmallCard } from '@components/card/SmallCard.tsx';
import { SimpleGrid } from '@mantine/core';

const mockData = [
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Ремонт квартир',
    price: '800 руб за час',
    district: 'Р-н Советский',
    date: '20/12/2025',
    rating: 4,
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
