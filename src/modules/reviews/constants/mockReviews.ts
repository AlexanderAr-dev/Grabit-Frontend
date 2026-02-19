import { IReview } from '@app-types';

export const mockReviews: IReview[] = [
  {
    id: 1,
    author: {
      id: 1,
      name: 'Андрей Плотников',
      avatar: {
        id: 1,
        url: 'https://avatars.mds.yandex.net/get-yapic/32838/M6V6WbojOM0WKom5I1PGICKSPEA-1/orig',
      },
    },
    rating: 4.5,
    createdDate: '2025-09-11',
    adName: 'Ремонт квартиры',
    text: 'Решил сделать капитальный ремонт в двухкомнатной квартире и выбрал эту компанию по совету знакомых. В целом остался очень доволен, хотя не обошлось без мелких шероховатостей. Стены идеально выровнены, плитка лежит ровно, швы аккуратные.',
  },
  {
    id: 3,
    author: {
      id: 1,
      name: 'Андрей Плотников',
      avatar: {
        id: 1,
        url: 'https://avatars.mds.yandex.net/get-yapic/32838/M6V6WbojOM0WKom5I1PGICKSPEA-1/orig',
      },
    },
    rating: 1.2,
    createdDate: '2025-09-10',
    adName: 'Ремонт квартиры 2',
    text: 'Хуже сервиса не встречал. Обещали одно, сделали совсем другое. Плинтусы отваливаются, углы кривые. Деньги заплачены, а нервов потратил море.',
  },
  {
    id: 4,
    author: {
      id: 1,
      name: 'Андрей Плотников',
      avatar: {
        id: 1,
        url: 'https://avatars.mds.yandex.net/get-yapic/32838/M6V6WbojOM0WKom5I1PGICKSPEA-1/orig',
      },
    },
    rating: 3.5,
    createdDate: '2025-09-07',
    adName: 'Ремонт квартиры 2',
    text: 'Средненько. Обещали закончить за три недели — вышло почти месяц. Покраска стен местами неровная, исправили только после претензий. Цены нормальные, но контроль нужен.',
  },
];
