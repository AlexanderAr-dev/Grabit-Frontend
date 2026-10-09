import { http, HttpResponse } from 'msw';

import type { BackendListing } from '@shared/api';

import {
  bookings,
  categories,
  categoryWithChildren,
  center,
  DemoListing,
  findListing,
  findUser,
  hash,
  HOUR,
  iso,
  listings,
  ME,
  nextId,
  reviews,
  toBackendCategory,
  toBackendListing,
} from '../db';
import { toBookingListItem } from './booking';
import {
  authed,
  fail,
  getAllParam,
  notFound,
  num,
  ok,
  open,
  paginate,
  query,
  readJson,
  WEB,
} from './utils';

type ListingBody = Partial<
  Pick<
    DemoListing,
    | 'title'
    | 'description'
    | 'category_id'
    | 'price_per_hour'
    | 'quantity'
    | 'buffer_hours'
    | 'address'
    | 'attributes'
  >
> & {
  lat?: number;
  lon?: number;
};

const SORTS: Record<
  string,
  (a: BackendListing, b: BackendListing) => number
> = {
  new: (a, b) => b.created_at.localeCompare(a.created_at),
  old: (a, b) => a.created_at.localeCompare(b.created_at),
  cheap: (a, b) => a.price_per_hour - b.price_per_hour,
  expensive: (a, b) => b.price_per_hour - a.price_per_hour,
  popular: (a, b) => b.review_count - a.review_count,
  highRating: (a, b) => b.avg_rating - a.avg_rating,
  lowRating: (a, b) => a.avg_rating - b.avg_rating,
};

const EDITABLE_FIELDS = [
  'title',
  'description',
  'price_per_hour',
  'quantity',
  'buffer_hours',
  'address',
  'attributes',
] as const;

const isKnownCategory = (id: unknown) =>
  categories.some(c => c.id === id);

/** Копирует в объявление только разрешённые поля тела запроса */
const applyBody = (l: DemoListing, body: ListingBody) => {
  const { lat, lon } = body;
  EDITABLE_FIELDS.forEach(key => {
    if (body[key] !== undefined)
      Object.assign(l, { [key]: body[key] });
  });
  if (isKnownCategory(body.category_id))
    l.category_id = body.category_id!;
  l.updated_at = iso(Date.now());
  if (typeof lat === 'number' && typeof lon === 'number') {
    l.dlat = lat - center.lat;
    l.dlon = lon - center.lon;
  }
};

/** Объявление, которым может управлять только владелец */
const ownListing = (id: string) => {
  const l = findListing(id);
  return l && l.owner_id === ME && l.status !== 'deleted'
    ? l
    : undefined;
};

// Загруженные «в хранилище» видео: object_key → blob URL
const uploadedVideos = new Map<string, string>();

/** YYYY-MM-DD в локальном времени — как формирует даты фронт (dayjs) */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Занятые часы объявления на дату — по реальным бронированиям */
const busyHours = (listingId: string, date: string) => {
  const dayStart = new Date(`${date}T00:00:00`).getTime();
  const hours = new Set<number>();
  bookings
    .filter(
      b =>
        b.listing_id === listingId &&
        ['pending', 'approved', 'active'].includes(
          b.status,
        ),
    )
    .forEach(b => {
      for (
        let t = new Date(b.start_time).getTime();
        t < new Date(b.end_time).getTime();
        t += HOUR
      ) {
        if (t >= dayStart && t < dayStart + 24 * HOUR)
          hours.add(new Date(t).getHours());
      }
    });
  return hours;
};

export const rentHandlers = [
  http.get(
    `${WEB}/rent/categories`,
    open(() =>
      ok({ categories: categories.map(toBackendCategory) }),
    ),
  ),

  // /my должен быть выше /:id
  http.get(
    `${WEB}/rent/listings/my`,
    authed(({ request }) => {
      const params = query(request);
      const status = params.get('status');
      const items = listings
        .filter(
          l =>
            l.owner_id === ME &&
            l.status !== 'deleted' &&
            (!status || l.status === status),
        )
        .map(toBackendListing)
        .sort(SORTS.new);
      return ok(
        paginate(
          items,
          num(params.get('page'), 1),
          num(params.get('page_size'), 20),
        ),
      );
    }),
  ),

  http.get(
    `${WEB}/rent/listings`,
    open(({ request }) => {
      const params = query(request);
      const lat = params.get('lat');
      const lon = params.get('lon');
      if (lat && lon)
        Object.assign(center, {
          lat: Number(lat),
          lon: Number(lon),
        });

      const search = params
        .get('query')
        ?.trim()
        .toLowerCase();
      const categoryId = params.get('category_id');
      const allowedCategories = categoryId
        ? categoryWithChildren(Number(categoryId))
        : null;
      const minPrice = num(params.get('min_price'), 0);
      const maxPrice = num(
        params.get('max_price'),
        Infinity,
      );
      const ownerId = params.get('owner_id');

      const items = listings
        .filter(l => l.status === 'active')
        .filter(l => !ownerId || l.owner_id === ownerId)
        .filter(
          l =>
            !allowedCategories ||
            allowedCategories.includes(l.category_id),
        )
        .filter(
          l =>
            l.price_per_hour >= minPrice &&
            l.price_per_hour <= maxPrice,
        )
        .filter(
          l =>
            !search ||
            `${l.title} ${l.description}`
              .toLowerCase()
              .includes(search),
        )
        .map(toBackendListing)
        .sort(
          SORTS[params.get('sort') ?? 'new'] ?? SORTS.new,
        );

      return ok(
        paginate(
          items,
          num(params.get('page'), 1),
          num(params.get('page_size'), 20),
        ),
      );
    }),
  ),

  http.post(
    `${WEB}/rent/listings`,
    authed(async ({ request }) => {
      const body = await readJson<ListingBody>(request);
      if (!body.title || !isKnownCategory(body.category_id))
        return fail(
          400,
          'VALIDATION_ERROR',
          'Заполните название и категорию',
        );
      const now = iso(Date.now());
      const l: DemoListing = {
        listing_id: nextId('l'),
        owner_id: ME,
        title: '',
        description: '',
        category_id: body.category_id!,
        price_per_hour: 0,
        quantity: 1,
        buffer_hours: 0,
        dlat: (hash(now) % 60) / 1000 - 0.03,
        dlon: (hash(`${now}lon`) % 80) / 1000 - 0.04,
        address: '',
        status: 'active',
        attributes: [],
        media: [],
        created_at: now,
        updated_at: now,
      };
      applyBody(l, body);
      listings.push(l);
      return ok(toBackendListing(l), 201);
    }),
  ),

  http.get(
    `${WEB}/rent/listings/:id`,
    open(({ params }) => {
      const l = findListing(params.id as string);
      if (!l || l.status === 'deleted') return notFound();
      return ok(toBackendListing(l));
    }),
  ),

  http.put(
    `${WEB}/rent/listings/:id`,
    authed(async ({ params, request }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      applyBody(l, await readJson<ListingBody>(request));
      return ok(toBackendListing(l));
    }),
  ),

  http.delete(
    `${WEB}/rent/listings/:id`,
    authed(({ params }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      l.status = 'deleted';
      return ok(null);
    }),
  ),

  http.post(
    `${WEB}/rent/listings/:id/pause`,
    authed(({ params }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      l.status = 'paused';
      return ok(null);
    }),
  ),

  http.post(
    `${WEB}/rent/listings/:id/resume`,
    authed(({ params }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      l.status = 'active';
      return ok(null);
    }),
  ),

  // Расписание доступности в демо не храним — просто подтверждаем сохранение
  http.put(
    `${WEB}/rent/listings/:id/availability`,
    authed(() => ok(null)),
  ),

  http.get(
    `${WEB}/rent/listings/:id/calendar`,
    open(({ params, request }) => {
      const listingId = params.id as string;
      const q = query(request);
      const year = num(
        q.get('year'),
        new Date().getFullYear(),
      );
      const month = num(
        q.get('month'),
        new Date().getMonth() + 1,
      );
      const today = dayKey(new Date());
      const daysInMonth = new Date(
        year,
        month,
        0,
      ).getDate();

      const days = Array.from(
        { length: daysInMonth },
        (_, i) => {
          const date = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          if (date < today)
            return { date, utilization: null };
          // Реальная занятость + немного «шума», чтобы тепловая карта выглядела живой
          const booked =
            (busyHours(listingId, date).size / 14) * 100;
          const noise = [0, 0, 0, 15, 30, 50][
            hash(listingId + date) % 6
          ];
          return {
            date,
            utilization: Math.min(
              100,
              Math.round(booked + noise),
            ),
          };
        },
      );

      return ok({
        listing_id: listingId,
        year,
        month,
        days,
      });
    }),
  ),

  http.get(
    `${WEB}/rent/listings/:id/slots`,
    open(({ params, request }) => {
      const date =
        query(request).get('date') ?? dayKey(new Date());
      const busy = busyHours(params.id as string, date);
      const now = new Date();
      const isToday = date === dayKey(now);
      const available =
        date < dayKey(now)
          ? []
          : Array.from(
              { length: 14 },
              (_, i) => i + 8,
            ).filter(
              h =>
                !busy.has(h) &&
                (!isToday || h > now.getHours()),
            );
      return ok({ date, available_hours: available });
    }),
  ),

  http.get(
    `${WEB}/rent/listings/:id/bookings`,
    authed(({ params, request }) => {
      const q = query(request);
      const status = q.get('status');
      const items = bookings
        .filter(
          b =>
            b.listing_id === params.id &&
            (!status || b.status === status),
        )
        .sort((a, b) =>
          b.start_time.localeCompare(a.start_time),
        )
        .map(b => toBookingListItem(b, ME));
      return ok(
        paginate(
          items,
          num(q.get('page'), 1),
          num(q.get('page_size'), 20),
        ),
      );
    }),
  ),

  http.get(
    `${WEB}/rent/listings/:id/reviews`,
    open(({ params, request }) => {
      const q = query(request);
      const ratings = getAllParam(q, 'rating').map(Number);
      const items = reviews
        .filter(
          r =>
            r.listing_id === params.id &&
            r.review_type === 'renter_to_listing',
        )
        .filter(
          r =>
            !ratings.length || ratings.includes(r.rating),
        )
        .map(r => ({
          ...r,
          author_is_premium:
            findUser(r.author_id)?.is_premium ?? false,
        }));
      sortReviews(items, q.get('sort'));
      return ok(
        paginate(
          items,
          num(q.get('page'), 1),
          num(q.get('page_size'), 20),
        ),
      );
    }),
  ),

  http.get(
    `${WEB}/rent/users/:id/reviews`,
    open(({ params, request }) => {
      const q = query(request);
      const ratings = getAllParam(q, 'rating').map(Number);
      const items = reviews
        .filter(r => r.target_id === params.id)
        .filter(
          r =>
            !ratings.length || ratings.includes(r.rating),
        )
        .map(r => ({
          ...r,
          author_is_premium:
            findUser(r.author_id)?.is_premium ?? false,
        }));
      sortReviews(items, q.get('sort'));
      return ok(
        paginate(
          items,
          num(q.get('page'), 1),
          num(q.get('page_size'), 20),
        ),
      );
    }),
  ),

  // ---- Медиа ----

  http.post(
    `${WEB}/rent/listings/:id/media/photo`,
    authed(async ({ params, request }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File))
        return fail(400, 'VALIDATION_ERROR', 'Нет файла');
      const media = {
        id: nextId('m'),
        url: URL.createObjectURL(file),
        media_type: 'photo',
        sort_order: num(
          form.get('sort_order') as string | null,
          l.media.length,
        ),
      };
      l.media.push(media);
      return ok({
        media_id: media.id,
        media_type: media.media_type,
        sort_order: media.sort_order,
        url: media.url,
      });
    }),
  ),

  http.post(
    `${WEB}/rent/listings/:id/media/video/upload-url`,
    authed(() => {
      const objectKey = nextId('video');
      return ok({
        upload_url: `${WEB}/demo-storage/${objectKey}`,
        object_key: objectKey,
      });
    }),
  ),

  // «Хранилище» для presigned-загрузки видео (вместо MinIO)
  http.put(
    `${WEB}/demo-storage/:key`,
    async ({ params, request }) => {
      uploadedVideos.set(
        params.key as string,
        URL.createObjectURL(await request.blob()),
      );
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.post(
    `${WEB}/rent/listings/:id/media/video/confirm`,
    authed(async ({ params, request }) => {
      const l = ownListing(params.id as string);
      const { object_key, sort_order } = await readJson<{
        object_key: string;
        sort_order: number;
      }>(request);
      const url = uploadedVideos.get(object_key);
      if (!l || !url) return notFound();
      const media = {
        id: nextId('m'),
        url,
        media_type: 'video',
        sort_order,
      };
      l.media.push(media);
      return ok({
        media_id: media.id,
        media_type: media.media_type,
        sort_order,
        url,
      });
    }),
  ),

  ...(['photo', 'video'] as const).map(type =>
    http.put(
      `${WEB}/rent/listings/:id/media/${type}/reorder`,
      authed(async ({ params, request }) => {
        const l = ownListing(params.id as string);
        if (!l) return notFound();
        const items =
          await readJson<
            { media_id: string; sort_order: number }[]
          >(request);
        items.forEach(({ media_id, sort_order }) => {
          const m = l.media.find(x => x.id === media_id);
          if (m) m.sort_order = sort_order;
        });
        return ok(null);
      }),
    ),
  ),

  http.delete(
    `${WEB}/rent/listings/:id/media/:mediaId`,
    authed(({ params }) => {
      const l = ownListing(params.id as string);
      if (!l) return notFound();
      l.media = l.media.filter(
        m => m.id !== params.mediaId,
      );
      return ok(null);
    }),
  ),
];

function sortReviews(
  items: { rating: number; created_at: string }[],
  sort: string | null,
) {
  const byDate = (
    a: { created_at: string },
    b: { created_at: string },
  ) => b.created_at.localeCompare(a.created_at);
  if (sort === 'old') items.sort((a, b) => -byDate(a, b));
  else if (sort === 'high')
    items.sort(
      (a, b) => b.rating - a.rating || byDate(a, b),
    );
  else if (sort === 'low')
    items.sort(
      (a, b) => a.rating - b.rating || byDate(a, b),
    );
  else items.sort(byDate);
}
