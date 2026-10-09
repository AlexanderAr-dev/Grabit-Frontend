// In-memory "база данных" демо-режима. Живёт до перезагрузки страницы.
import type {
  AdminCategory,
  AdminUser,
} from '@features/admin/api/adminService';
import type {
  BackendCategory,
  BackendListing,
  BackendReview,
  BackendUserResponse,
  BookingExtension,
  BookingStatus,
  NotificationItem,
} from '@shared/api';
import type { MessageResp } from '@shared/types/chat';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const iso = (ms: number) =>
  new Date(ms).toISOString();
const hourAligned = (offsetHours: number) =>
  Math.floor(Date.now() / HOUR) * HOUR + offsetHours * HOUR;
const daysAgo = (days: number) =>
  iso(Date.now() - days * DAY);

// Детерминированный псевдослучайный хеш — чтобы календарь не «прыгал» между запросами
export const hash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

let idCounter = 1000;
export const nextId = (prefix: string) =>
  `${prefix}-${++idCounter}`;

// ---------- Пользователи ----------

export interface DemoUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  profile_complete: boolean;
  is_premium: boolean;
  subscription_expires_at?: string;
  blocked: boolean;
  created_at: string;
}

export const ME = 'u-demo';

const named: DemoUser[] = [
  {
    id: ME,
    email: 'demo@grabit.dev',
    username: 'demo',
    first_name: 'Иван',
    last_name: 'Смирнов',
    phone: '+7 900 000-00-00',
    gender: 'male',
    birth_date: '2002-05-14',
    profile_complete: true,
    is_premium: false,
    blocked: false,
    created_at: daysAgo(120),
  },
  {
    id: 'u-2',
    email: 'maria@example.com',
    username: 'maria_k',
    first_name: 'Мария',
    last_name: 'Козлова',
    profile_complete: true,
    is_premium: true,
    subscription_expires_at: iso(Date.now() + 20 * DAY),
    blocked: false,
    created_at: daysAgo(300),
  },
  {
    id: 'u-3',
    email: 'dmitry@example.com',
    username: 'd_volkov',
    first_name: 'Дмитрий',
    last_name: 'Волков',
    profile_complete: true,
    is_premium: false,
    blocked: false,
    created_at: daysAgo(210),
  },
  {
    id: 'u-4',
    email: 'anna@example.com',
    username: 'anna.s',
    first_name: 'Анна',
    last_name: 'Соколова',
    profile_complete: true,
    is_premium: false,
    blocked: false,
    created_at: daysAgo(95),
  },
  {
    id: 'u-5',
    email: 'egor@example.com',
    username: 'egor_n',
    first_name: 'Егор',
    last_name: 'Новиков',
    profile_complete: true,
    is_premium: true,
    subscription_expires_at: iso(Date.now() + 5 * DAY),
    blocked: false,
    created_at: daysAgo(60),
  },
];

// Массовка — чтобы в админке была пагинация
const FIRST = [
  'Алексей',
  'Ольга',
  'Сергей',
  'Елена',
  'Павел',
  'Ксения',
  'Артём',
  'Дарья',
  'Никита',
  'Полина',
];
const LAST = [
  'Иванов',
  'Кузнецова',
  'Попов',
  'Васильева',
  'Морозов',
  'Лебедева',
  'Фёдоров',
  'Орлова',
  'Зайцев',
  'Белова',
];
const extras: DemoUser[] = Array.from(
  { length: 28 },
  (_, i) => ({
    id: `u-x${i + 1}`,
    email: `user${i + 1}@example.com`,
    username: `user_${i + 1}`,
    first_name: FIRST[i % FIRST.length],
    last_name: LAST[(i * 3) % LAST.length],
    profile_complete: i % 7 !== 0,
    is_premium: i % 9 === 0,
    blocked: i % 11 === 5,
    created_at: daysAgo(i * 4 + 1),
  }),
);

export const users: DemoUser[] = [...named, ...extras];

export const findUser = (id: string) =>
  users.find(u => u.id === id);

// ---------- Категории ----------

interface DemoCategory {
  id: number;
  parent_id?: number;
  name_ru: string;
  name_en: string;
  slug: string;
  sort_order: number;
}

export const categories: DemoCategory[] = [
  {
    id: 1,
    name_ru: 'Электроника',
    name_en: 'Electronics',
    slug: 'electronics',
    sort_order: 1,
  },
  {
    id: 2,
    name_ru: 'Инструменты',
    name_en: 'Tools',
    slug: 'tools',
    sort_order: 2,
  },
  {
    id: 3,
    name_ru: 'Спорт и отдых',
    name_en: 'Sports',
    slug: 'sports',
    sort_order: 3,
  },
  {
    id: 4,
    name_ru: 'Музыка',
    name_en: 'Music',
    slug: 'music',
    sort_order: 4,
  },
  {
    id: 5,
    name_ru: 'Туризм',
    name_en: 'Travel',
    slug: 'travel',
    sort_order: 5,
  },
  {
    id: 11,
    parent_id: 1,
    name_ru: 'Фото и видео',
    name_en: 'Photo & video',
    slug: 'photo',
    sort_order: 1,
  },
  {
    id: 12,
    parent_id: 1,
    name_ru: 'Игровые приставки',
    name_en: 'Consoles',
    slug: 'consoles',
    sort_order: 2,
  },
  {
    id: 13,
    parent_id: 1,
    name_ru: 'Аудио',
    name_en: 'Audio',
    slug: 'audio',
    sort_order: 3,
  },
  {
    id: 14,
    parent_id: 1,
    name_ru: 'Проекторы',
    name_en: 'Projectors',
    slug: 'projectors',
    sort_order: 4,
  },
  {
    id: 15,
    parent_id: 1,
    name_ru: 'Дроны',
    name_en: 'Drones',
    slug: 'drones',
    sort_order: 5,
  },
  {
    id: 21,
    parent_id: 2,
    name_ru: 'Электроинструмент',
    name_en: 'Power tools',
    slug: 'power-tools',
    sort_order: 1,
  },
  {
    id: 31,
    parent_id: 3,
    name_ru: 'Велосипеды',
    name_en: 'Bikes',
    slug: 'bikes',
    sort_order: 1,
  },
  {
    id: 32,
    parent_id: 3,
    name_ru: 'Зимний спорт',
    name_en: 'Winter sports',
    slug: 'winter',
    sort_order: 2,
  },
  {
    id: 33,
    parent_id: 3,
    name_ru: 'Скейтбординг',
    name_en: 'Skateboarding',
    slug: 'skate',
    sort_order: 3,
  },
  {
    id: 41,
    parent_id: 4,
    name_ru: 'Гитары',
    name_en: 'Guitars',
    slug: 'guitars',
    sort_order: 1,
  },
  {
    id: 51,
    parent_id: 5,
    name_ru: 'Палатки',
    name_en: 'Tents',
    slug: 'tents',
    sort_order: 1,
  },
];

export const toBackendCategory = (
  c: DemoCategory,
): BackendCategory => ({
  id: c.id,
  parent_id: c.parent_id,
  name: c.name_ru,
  slug: c.slug,
  sort_order: c.sort_order,
});

export const toAdminCategory = (
  c: DemoCategory,
): AdminCategory => ({
  ...c,
  listing_count: listings.filter(
    l => l.category_id === c.id && l.status !== 'deleted',
  ).length,
});

/** id категории + всех её подкатегорий */
export const categoryWithChildren = (id: number) => [
  id,
  ...categories
    .filter(c => c.parent_id === id)
    .map(c => c.id),
];

// ---------- Объявления ----------

export interface DemoMedia {
  id: string;
  url: string;
  media_type: string;
  sort_order: number;
}

export interface DemoListing {
  listing_id: string;
  owner_id: string;
  title: string;
  description: string;
  category_id: number;
  price_per_hour: number;
  quantity: number;
  buffer_hours: number;
  /** Смещение от центра выбранного города — объявления «переезжают» вместе с городом */
  dlat: number;
  dlon: number;
  address: string;
  status: 'active' | 'paused' | 'deleted';
  attributes: { key: string; value: string }[];
  media: DemoMedia[];
  created_at: string;
  updated_at: string;
}

const photo = (name: string, order = 0): DemoMedia => ({
  id: nextId('m'),
  url: `/demo/${name}.jpg`,
  media_type: 'photo',
  sort_order: order,
});

const listing = (
  l: Omit<
    DemoListing,
    'quantity' | 'buffer_hours' | 'status' | 'updated_at'
  > &
    Partial<DemoListing>,
): DemoListing => ({
  quantity: 1,
  buffer_hours: 1,
  status: 'active',
  updated_at: l.created_at,
  ...l,
});

export const listings: DemoListing[] = [
  listing({
    listing_id: 'l-1',
    owner_id: ME,
    title: 'Фотоаппарат Sony α6400 + 2 объектива',
    description:
      'Беззеркальная камера в отличном состоянии. В комплекте китовый 16-50 и портретный 50mm f/1.8, две батареи, карта памяти 64 ГБ и сумка. Подойдёт для съёмки мероприятий и путешествий.',
    category_id: 11,
    price_per_hour: 350,
    dlat: 0.012,
    dlon: -0.02,
    address: 'ул. Ленина, 45',
    attributes: [
      { key: 'Бренд', value: 'Sony' },
      { key: 'Матрица', value: 'APS-C, 24 Мп' },
      { key: 'Залог', value: '15 000 ₽' },
    ],
    media: [photo('camera')],
    created_at: daysAgo(40),
  }),
  listing({
    listing_id: 'l-2',
    owner_id: ME,
    title: 'Шуруповёрт Milwaukee M18 с двумя АКБ',
    description:
      'Мощный бесщёточный шуруповёрт, две батареи 5 Ач и зарядка. Набор бит и свёрл по дереву и металлу — бесплатно.',
    category_id: 21,
    price_per_hour: 150,
    quantity: 2,
    dlat: -0.018,
    dlon: 0.031,
    address: 'пр. Мира, 12',
    attributes: [
      { key: 'Бренд', value: 'Milwaukee' },
      { key: 'Напряжение', value: '18 В' },
    ],
    media: [photo('drill')],
    created_at: daysAgo(25),
  }),
  listing({
    listing_id: 'l-3',
    owner_id: 'u-2',
    title: 'Палатка 4-местная Outventure',
    description:
      'Двухслойная палатка с тамбуром, ставится за 10 минут. Отдаю с ковриками и тентом. После возврата — просушить, пожалуйста.',
    category_id: 51,
    price_per_hour: 120,
    dlat: 0.034,
    dlon: 0.012,
    address: 'ул. Карла Маркса, 78',
    attributes: [
      { key: 'Мест', value: '4' },
      { key: 'Вес', value: '6,2 кг' },
    ],
    media: [photo('tent')],
    created_at: daysAgo(60),
  }),
  listing({
    listing_id: 'l-4',
    owner_id: 'u-3',
    title: 'Акустическая гитара Yamaha F310',
    description:
      'Классическая «первая гитара»: удобная, держит строй. Чехол и каподастр в комплекте.',
    category_id: 41,
    price_per_hour: 100,
    dlat: -0.006,
    dlon: -0.044,
    address: 'ул. Взлётная, 7',
    attributes: [
      { key: 'Бренд', value: 'Yamaha' },
      { key: 'Струны', value: 'металл' },
    ],
    media: [photo('guitar')],
    created_at: daysAgo(80),
  }),
  listing({
    listing_id: 'l-5',
    owner_id: 'u-4',
    title: 'PlayStation 5 + 2 геймпада и 6 игр',
    description:
      'Приставка с дисководом, два DualSense и подборка игр: FIFA, Mortal Kombat, It Takes Two и другие. Отлично для вечеринки.',
    category_id: 12,
    price_per_hour: 250,
    dlat: 0.021,
    dlon: 0.052,
    address: 'ул. Партизана Железняка, 18',
    attributes: [
      { key: 'Геймпадов', value: '2' },
      { key: 'Игр', value: '6' },
    ],
    media: [photo('ps5')],
    created_at: daysAgo(15),
  }),
  listing({
    listing_id: 'l-6',
    owner_id: 'u-3',
    title: 'Квадрокоптер DJI Phantom 4',
    description:
      'Снимает 4K-видео, держит позицию по GPS. Три аккумулятора — около часа полёта. Перед арендой проведу короткий инструктаж.',
    category_id: 15,
    price_per_hour: 600,
    dlat: -0.03,
    dlon: -0.01,
    address: 'ул. Академика Киренского, 26',
    attributes: [
      { key: 'Бренд', value: 'DJI' },
      { key: 'Видео', value: '4K 60fps' },
      { key: 'Залог', value: '30 000 ₽' },
    ],
    media: [photo('drone')],
    created_at: daysAgo(33),
  }),
  listing({
    listing_id: 'l-7',
    owner_id: 'u-5',
    title: 'Горные лыжи Rossignol с ботинками',
    description:
      'Лыжи 170 см, ботинки 42 размера, палки. Канты заточены в начале сезона.',
    category_id: 32,
    price_per_hour: 200,
    dlat: 0.045,
    dlon: -0.035,
    address: 'ул. Свердловская, 101',
    attributes: [
      { key: 'Ростовка', value: '170 см' },
      { key: 'Размер ботинок', value: '42' },
    ],
    media: [photo('skis')],
    created_at: daysAgo(10),
  }),
  listing({
    listing_id: 'l-8',
    owner_id: 'u-2',
    title: 'Проектор для домашнего кинотеатра',
    description:
      'Full HD проектор, яркость 3500 лм. Экран 100" на треноге и HDMI-кабель 10 м в комплекте.',
    category_id: 14,
    price_per_hour: 300,
    dlat: -0.012,
    dlon: 0.065,
    address: 'ул. 9 Мая, 54',
    attributes: [{ key: 'Разрешение', value: '1920×1080' }],
    media: [photo('projector')],
    created_at: daysAgo(50),
  }),
  listing({
    listing_id: 'l-9',
    owner_id: 'u-4',
    title: 'Наушники с шумоподавлением',
    description:
      'Закрытые беспроводные наушники, до 30 часов работы. Удобно для перелётов и работы в опенспейсе.',
    category_id: 13,
    price_per_hour: 80,
    dlat: 0.008,
    dlon: 0.02,
    address: 'ул. Ленина, 113',
    attributes: [{ key: 'Тип', value: 'полноразмерные' }],
    media: [photo('headphones')],
    created_at: daysAgo(7),
  }),
  listing({
    listing_id: 'l-10',
    owner_id: 'u-5',
    title: 'Горный велосипед Trek Marlin 7',
    description:
      'Хардтейл на 29" колёсах, гидравлические тормоза. Шлем и замок выдаю бесплатно.',
    category_id: 31,
    price_per_hour: 180,
    dlat: -0.04,
    dlon: 0.004,
    address: 'Предмостная пл., 1',
    attributes: [
      { key: 'Размер рамы', value: 'L' },
      { key: 'Колёса', value: '29"' },
    ],
    media: [photo('bike')],
    created_at: daysAgo(20),
  }),
  listing({
    listing_id: 'l-11',
    owner_id: 'u-2',
    title: 'Скейтборд Santa Cruz',
    description:
      'Собранный комплит, подшипники ABEC-7. Подойдёт и новичку, и тому, кто вспоминает молодость.',
    category_id: 33,
    price_per_hour: 60,
    dlat: 0.027,
    dlon: -0.058,
    address: 'Набережная, 3',
    attributes: [{ key: 'Ширина деки', value: '8"' }],
    media: [photo('skateboard')],
    created_at: daysAgo(3),
  }),
  listing({
    listing_id: 'l-12',
    owner_id: ME,
    title: 'Дрель-шуруповёрт DeWalt',
    description:
      'Компактная дрель для бытовых задач. Сейчас на паузе — снимаю с аренды на время отпуска.',
    category_id: 21,
    price_per_hour: 90,
    dlat: 0.002,
    dlon: 0.041,
    address: 'ул. Урицкого, 61',
    status: 'paused',
    attributes: [{ key: 'Бренд', value: 'DeWalt' }],
    media: [photo('drill-2')],
    created_at: daysAgo(90),
  }),
];

export const findListing = (id: string) =>
  listings.find(l => l.listing_id === id);

// ---------- Отзывы ----------

const REVIEW_TEXTS: [number, string][] = [
  [
    5,
    'Всё отлично, вещь как на фото. Владелец на связи, рекомендую!',
  ],
  [
    5,
    'Забрал и вернул без проблем, договорились за пару минут.',
  ],
  [
    4,
    'Хорошее состояние, но пришлось немного подождать при передаче.',
  ],
  [
    5,
    'Пользовался на выходных — никаких нареканий. Возьму ещё.',
  ],
  [3, 'В целом нормально, но комплектация была не полной.'],
  [5, 'Очень аккуратный и вежливый владелец, спасибо!'],
  [4, 'Всё работает, цена адекватная.'],
];

const REVIEWERS = ['u-2', 'u-3', 'u-4', 'u-5', ME];

export const reviews: BackendReview[] = listings
  .filter(l => l.status === 'active')
  .flatMap((l, li) => {
    const count = (hash(l.listing_id) % 4) + 1;
    return Array.from(
      { length: count },
      (_, i): BackendReview => {
        const [rating, comment] =
          REVIEW_TEXTS[(li + i * 2) % REVIEW_TEXTS.length];
        const author = REVIEWERS.filter(
          u => u !== l.owner_id,
        )[(li + i) % 4];
        return {
          review_id: nextId('r'),
          booking_id: nextId('b-old'),
          listing_id: l.listing_id,
          author_id: author,
          target_id: l.owner_id,
          review_type: 'renter_to_listing',
          rating,
          comment,
          created_at: daysAgo(5 + li * 3 + i * 6),
        };
      },
    );
  });

// Отзыв владельца о демо-пользователе как об арендаторе
reviews.push({
  review_id: nextId('r'),
  booking_id: 'b-1',
  listing_id: 'l-4',
  author_id: 'u-3',
  target_id: ME,
  review_type: 'owner_to_renter',
  rating: 5,
  comment:
    'Вернул гитару вовремя и в идеальном состоянии. Надёжный арендатор!',
  created_at: daysAgo(9),
});

export const listingRating = (listingId: string) => {
  const list = reviews.filter(
    r =>
      r.listing_id === listingId &&
      r.review_type === 'renter_to_listing',
  );
  const avg = list.length
    ? list.reduce((s, r) => s + r.rating, 0) / list.length
    : 0;
  return {
    avg_rating: Math.round(avg * 10) / 10,
    review_count: list.length,
  };
};

export const userRating = (
  userId: string,
  as: 'owner' | 'renter',
) => {
  const list =
    as === 'owner'
      ? reviews.filter(
          r =>
            r.review_type === 'renter_to_listing' &&
            findListing(r.listing_id)?.owner_id === userId,
        )
      : reviews.filter(
          r =>
            r.review_type === 'owner_to_renter' &&
            r.target_id === userId,
        );
  const avg = list.length
    ? list.reduce((s, r) => s + r.rating, 0) / list.length
    : 0;
  return {
    avg: Math.round(avg * 10) / 10,
    count: list.length,
  };
};

// ---------- Бронирования ----------

export interface DemoBooking {
  booking_id: string;
  listing_id: string;
  renter_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  cancelled_by: 'owner' | 'renter' | 'system' | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  pending_extension: BookingExtension | null;
}

const booking = (b: {
  id: string;
  listing: string;
  renter: string;
  from: number;
  hours: number;
  status: BookingStatus;
  cancelledBy?: 'owner' | 'renter';
}): DemoBooking => {
  const l = findListing(b.listing)!;
  const start = hourAligned(b.from);
  return {
    booking_id: b.id,
    listing_id: b.listing,
    renter_id: b.renter,
    quantity: 1,
    start_time: iso(start),
    end_time: iso(start + b.hours * HOUR),
    status: b.status,
    cancelled_by: b.cancelledBy ?? null,
    total_price: l.price_per_hour * b.hours,
    created_at: iso(start - 2 * DAY),
    updated_at: iso(start - DAY),
    pending_extension: null,
  };
};

export const bookings: DemoBooking[] = [
  // Демо-пользователь арендует
  booking({
    id: 'b-1',
    listing: 'l-4',
    renter: ME,
    from: -10 * 24,
    hours: 5,
    status: 'completed',
  }),
  booking({
    id: 'b-2',
    listing: 'l-5',
    renter: ME,
    from: -2,
    hours: 24,
    status: 'active',
  }),
  booking({
    id: 'b-3',
    listing: 'l-3',
    renter: ME,
    from: 3 * 24 + 10,
    hours: 48,
    status: 'approved',
  }),
  booking({
    id: 'b-7',
    listing: 'l-10',
    renter: ME,
    from: -4 * 24,
    hours: 3,
    status: 'cancelled',
    cancelledBy: 'renter',
  }),
  booking({
    id: 'b-12',
    listing: 'l-6',
    renter: ME,
    from: 4 * 24 + 11,
    hours: 3,
    status: 'pending',
  }),
  // У демо-пользователя арендуют
  booking({
    id: 'b-4',
    listing: 'l-1',
    renter: 'u-2',
    from: 2 * 24 + 12,
    hours: 6,
    status: 'pending',
  }),
  booking({
    id: 'b-5',
    listing: 'l-2',
    renter: 'u-5',
    from: -3,
    hours: 8,
    status: 'active',
  }),
  booking({
    id: 'b-6',
    listing: 'l-1',
    renter: 'u-4',
    from: -20 * 24,
    hours: 4,
    status: 'completed',
  }),
  // Чужие — для админки и занятости календаря
  booking({
    id: 'b-8',
    listing: 'l-6',
    renter: 'u-4',
    from: 24 + 9,
    hours: 4,
    status: 'approved',
  }),
  booking({
    id: 'b-9',
    listing: 'l-8',
    renter: 'u-3',
    from: 5 * 24 + 18,
    hours: 5,
    status: 'pending',
  }),
  booking({
    id: 'b-10',
    listing: 'l-7',
    renter: 'u-x3',
    from: -15 * 24,
    hours: 6,
    status: 'completed',
  }),
  booking({
    id: 'b-11',
    listing: 'l-9',
    renter: 'u-x7',
    from: -1 * 24,
    hours: 2,
    status: 'no_show',
  }),
];

// Продление, ожидающее решения владельца (демо-пользователя)
const b5 = bookings.find(b => b.booking_id === 'b-5')!;
b5.pending_extension = {
  id: 'ext-1',
  booking_id: 'b-5',
  new_end_time: iso(
    new Date(b5.end_time).getTime() + 4 * HOUR,
  ),
  status: 'pending',
  created_at: iso(Date.now() - HOUR),
  updated_at: iso(Date.now() - HOUR),
};

export const findBooking = (id: string) =>
  bookings.find(b => b.booking_id === id);

export const hasMyReview = (
  b: DemoBooking,
  userId: string,
) =>
  reviews.some(
    r =>
      r.booking_id === b.booking_id &&
      r.author_id === userId,
  );

// ---------- Чаты ----------

export interface DemoConversation {
  conversation_id: string;
  listing_id: string;
  booking_id: string;
  renter_id: string;
  owner_id: string;
  is_muted: boolean;
  /** Сколько непрочитанных у демо-пользователя */
  unread: number;
  created_at: string;
}

export const conversations: DemoConversation[] = [
  {
    conversation_id: 'c-1',
    listing_id: 'l-4',
    booking_id: 'b-1',
    renter_id: ME,
    owner_id: 'u-3',
    is_muted: false,
    unread: 0,
    created_at: daysAgo(12),
  },
  {
    conversation_id: 'c-2',
    listing_id: 'l-1',
    booking_id: 'b-4',
    renter_id: 'u-2',
    owner_id: ME,
    is_muted: false,
    unread: 2,
    created_at: daysAgo(1),
  },
  {
    conversation_id: 'c-3',
    listing_id: 'l-5',
    booking_id: 'b-2',
    renter_id: ME,
    owner_id: 'u-4',
    is_muted: false,
    unread: 0,
    created_at: daysAgo(3),
  },
];

const msg = (
  conversation: string,
  sender: string,
  content: string,
  minutesAgo: number,
  read = true,
): MessageResp => ({
  message_id: nextId('msg'),
  conversation_id: conversation,
  sender_id: sender,
  message_type: 0,
  content,
  is_deleted: false,
  is_edited: false,
  sent_at: iso(Date.now() - minutesAgo * 60 * 1000),
  read_at: read
    ? iso(Date.now() - (minutesAgo - 1) * 60 * 1000)
    : null,
});

/** Сообщения по возрастанию времени */
export const messages: Record<string, MessageResp[]> = {
  'c-1': [
    msg(
      'c-1',
      ME,
      'Здравствуйте! Гитара свободна в субботу с 12:00?',
      12 * 24 * 60,
    ),
    msg(
      'c-1',
      'u-3',
      'Добрый день! Да, свободна. Чехол и каподастр положу.',
      12 * 24 * 60 - 15,
    ),
    msg(
      'c-1',
      ME,
      'Отлично, тогда бронирую на 5 часов.',
      12 * 24 * 60 - 20,
    ),
    msg(
      'c-1',
      'u-3',
      'Спасибо, что вернули вовремя! Обращайтесь ещё 🙂',
      10 * 24 * 60 - 400,
    ),
  ],
  'c-2': [
    msg(
      'c-2',
      'u-2',
      'Привет! Хочу взять камеру на свадьбу подруги.',
      26 * 60,
    ),
    msg('c-2', ME, 'Привет! Конечно, какие даты?', 25 * 60),
    msg(
      'c-2',
      'u-2',
      'Отправила запрос на бронирование, послезавтра с 12 до 18.',
      40,
      false,
    ),
    msg(
      'c-2',
      'u-2',
      'Портретный объектив тоже будет в комплекте?',
      38,
      false,
    ),
  ],
  'c-3': [
    msg(
      'c-3',
      ME,
      'Добрый вечер! Можно забрать приставку сегодня после 19?',
      3 * 24 * 60,
    ),
    msg(
      'c-3',
      'u-4',
      'Да, подъезжайте. Игры уже установлены.',
      3 * 24 * 60 - 30,
    ),
  ],
};

export const blockedUsers = new Set<string>();

// Автоответы собеседника в демо-чате
export const AUTO_REPLIES = [
  'Да, конечно! 👍',
  'Хорошо, договорились.',
  'Сейчас уточню и напишу.',
  'Отлично, жду вас в назначенное время.',
  'Спасибо за сообщение! Отвечу чуть позже.',
];

// ---------- Уведомления ----------

const notif = (
  n: Omit<
    NotificationItem,
    'id' | 'is_read' | 'read_at'
  > & { is_read?: boolean },
): NotificationItem => ({
  id: nextId('n'),
  is_read: false,
  read_at: null,
  ...n,
});

export const notifications: NotificationItem[] = [
  notif({
    title: 'Новый запрос на бронирование',
    body: 'Мария хочет арендовать «Фотоаппарат Sony α6400»',
    event_type: 'booking.created',
    created_at: iso(Date.now() - 40 * 60 * 1000),
    data: JSON.stringify({ booking_id: 'b-4' }),
  }),
  notif({
    title: 'Запрос на продление',
    body: 'Егор просит продлить аренду шуруповёрта на 4 часа',
    event_type: 'booking.extension_requested',
    created_at: iso(Date.now() - 60 * 60 * 1000),
    data: JSON.stringify({ booking_id: 'b-5' }),
  }),
  notif({
    title: 'Бронирование подтверждено',
    body: 'Владелец подтвердил аренду палатки',
    event_type: 'booking.approved',
    created_at: daysAgo(1),
    data: JSON.stringify({ booking_id: 'b-3' }),
    is_read: true,
  }),
  notif({
    title: 'Оставьте отзыв',
    body: 'Как прошла аренда гитары Yamaha?',
    event_type: 'booking.completed',
    created_at: daysAgo(10),
    data: JSON.stringify({ booking_id: 'b-1' }),
    is_read: true,
  }),
];

export const notificationPrefs = {
  browser_push_enabled: true,
  email_enabled: true,
  inbox_enabled: true,
  mobile_push_enabled: false,
};

// ---------- Преобразования в форматы бэкенда ----------

/** Центр последнего поиска — чтобы карточка объявления открывалась в том же городе */
export const center = { lat: 56.0153, lon: 92.8932 };

export const toBackendListing = (
  l: DemoListing,
): BackendListing => {
  const category =
    categories.find(c => c.id === l.category_id) ??
    categories[0];
  const owner = findUser(l.owner_id);
  return {
    listing_id: l.listing_id,
    owner_id: l.owner_id,
    title: l.title,
    description: l.description,
    price_per_hour: l.price_per_hour,
    quantity: l.quantity,
    buffer_hours: l.buffer_hours,
    address: l.address,
    lat: center.lat + l.dlat,
    lon: center.lon + l.dlon,
    status: l.status,
    ...listingRating(l.listing_id),
    owner_is_premium: owner?.is_premium ?? false,
    category: toBackendCategory(category),
    // Период, в который объявление можно бронировать (null + null = расписание не задано)
    available_from: l.created_at,
    available_until: iso(Date.now() + 90 * DAY),
    attributes: l.attributes,
    media: [...l.media].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    created_at: l.created_at,
    updated_at: l.updated_at,
  };
};

export const toBackendUser = (
  u: DemoUser,
): BackendUserResponse => {
  const owner = userRating(u.id, 'owner');
  const renter = userRating(u.id, 'renter');
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    first_name: u.first_name,
    last_name: u.last_name,
    gender: u.gender,
    birth_date: u.birth_date,
    phone: u.phone,
    language: 'ru',
    avatar_url: u.avatar_url,
    profile_complete: u.profile_complete,
    active_listings_count: listings.filter(
      l => l.owner_id === u.id && l.status === 'active',
    ).length,
    avg_rating_as_owner: owner.avg,
    review_count_as_owner: owner.count,
    avg_rating_as_renter: renter.avg,
    review_count_as_renter: renter.count,
    created_at: u.created_at,
    is_premium: u.is_premium,
    subscription_tier: u.is_premium ? 'premium' : 'free',
    subscription_expires_at: u.subscription_expires_at,
  };
};

export const toAdminUser = (u: DemoUser): AdminUser => ({
  id: u.id,
  keycloak_id: `kc-${u.id}`,
  email: u.email,
  username: u.username,
  first_name: u.first_name,
  last_name: u.last_name,
  profile_complete: u.profile_complete,
  blocked: u.blocked,
  created_at: u.created_at,
});

export { DAY, HOUR };
