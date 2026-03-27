import { IRentalDetail } from '@shared/types';

export const mockRentAd: IRentalDetail[] = [
  {
    id: 1,
    title: 'Ремонт квартир',
    cost: { payment: 500, priceUnit: 'неделя' },
    category: { id: 1, name: 'Ремонт' },
    productType: 'service',
    address:
      'Красноярский край, г. Красноярск, Р-н Советский, ул. Краснодарская, 406',
    rating: 4.5,
    reviewCount: 12,
    previewImage: {
      id: 1,
      url: 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
    },
    description:
      'Ремонт под ключ с гарантией качества: быстро, аккуратно и по доступной цене.',
    createdDate: '2025-12-20',
    media: [
      {
        id: 1,
        url: 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6672b69ac44ca74a3aa7ded9_6672b7d4867ea0000933d652/scale_1200',
      },
    ],
    renter: {
      id: 1,
      name: 'Thomas Selby',
      rating: 4.2,
      reviewCount: 142,
      avatar: {
        id: 2,
        url: 'https://i.pinimg.com/236x/59/fe/e8/59fee8d585ce597b3878d7be5e83beea.jpg?nii=t',
      },
    },
    reviews: 12,
    bookingCalendar: '12-20-2025 13-23-2026',
  },
  {
    id: 2,
    title: 'Аренда перфоратора Bosch',
    cost: { payment: 800, priceUnit: 'день' },
    category: { id: 5, name: 'Инструменты' },
    productType: 'product',
    address:
      'Красноярский край, г. Красноярск, Р-н Октябрьский, ул. Высотная, 15',
    rating: 4.8,
    reviewCount: 34,
    previewImage: {
      id: 3,
      url: 'https://avatars.mds.yandex.net/get-marketpic/6097805/pic6f2c8b2d3b1a1c5b8f4c8a3b0c1d2e3f/orig',
    },
    description:
      'Мощный перфоратор Bosch GBH 2-26 DRE. Идеален для сверления бетона, кирпича, камня.',
    createdDate: '2026-02-10',
    media: [
      {
        id: 3,
        url: 'https://avatars.mds.yandex.net/get-marketpic/6097805/pic6f2c8b2d3b1a1c5b8f4c8a3b0c1d2e3f/orig',
      },
    ],
    renter: {
      id: 3,
      name: 'Елена Петрова',
      rating: 4.9,
      reviewCount: 87,
      avatar: {
        id: 5,
        url: 'https://i.pinimg.com/236x/80/df/71/80df71e5e5f5b5f5b5f5b5f5b5f5b5f5.jpg',
      },
    },
    reviews: 34,
    bookingCalendar: '12-20-2025 13-23-2026',
  },
];
