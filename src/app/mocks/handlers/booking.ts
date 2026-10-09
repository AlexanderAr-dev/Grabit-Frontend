import { http } from 'msw';

import type {
  BackendReview,
  BookingItem,
  BookingListItem,
  BookingStatus,
} from '@shared/api';

import {
  bookings,
  DemoBooking,
  findBooking,
  findListing,
  findUser,
  hasMyReview,
  HOUR,
  iso,
  ME,
  nextId,
  reviews,
  toBackendListing,
} from '../db';
import {
  authed,
  fail,
  notFound,
  num,
  ok,
  paginate,
  query,
  readJson,
  WEB,
} from './utils';

const hoursBetween = (start: string, end: string) =>
  Math.max(
    1,
    Math.ceil(
      (new Date(end).getTime() -
        new Date(start).getTime()) /
        HOUR,
    ),
  );

const recalcPrice = (b: DemoBooking) => {
  const l = findListing(b.listing_id)!;
  b.total_price =
    l.price_per_hour *
    b.quantity *
    hoursBetween(b.start_time, b.end_time);
};

export const toBookingItem = (
  b: DemoBooking,
  viewer: string,
): BookingItem => ({
  booking_id: b.booking_id,
  listing_id: b.listing_id,
  renter_id: b.renter_id,
  quantity: b.quantity,
  start_time: b.start_time,
  end_time: b.end_time,
  status: b.status,
  cancelled_by: b.cancelled_by,
  total_price: b.total_price,
  created_at: b.created_at,
  updated_at: b.updated_at,
  pending_extension: b.pending_extension,
  renter_is_premium:
    findUser(b.renter_id)?.is_premium ?? false,
  has_my_review: hasMyReview(b, viewer),
});

export const toBookingListItem = (
  b: DemoBooking,
  viewer: string,
): BookingListItem => {
  const l = toBackendListing(findListing(b.listing_id)!);
  const item = toBookingItem(b, viewer);
  return {
    booking_id: item.booking_id,
    renter_id: item.renter_id,
    quantity: item.quantity,
    start_time: item.start_time,
    end_time: item.end_time,
    status: item.status,
    cancelled_by: item.cancelled_by,
    total_price: item.total_price,
    created_at: item.created_at,
    updated_at: item.updated_at,
    renter_is_premium: item.renter_is_premium,
    has_my_review: item.has_my_review,
    listing: {
      listing_id: l.listing_id,
      owner_id: l.owner_id,
      title: l.title,
      price_per_hour: l.price_per_hour,
      address: l.address,
      status: l.status,
      avg_rating: l.avg_rating,
      review_count: l.review_count,
      cover_url: l.media[0]?.url ?? null,
      owner_is_premium: l.owner_is_premium,
    },
  };
};

const ownerOf = (b: DemoBooking) =>
  findListing(b.listing_id)?.owner_id;

const touch = (b: DemoBooking, status?: BookingStatus) => {
  if (status) b.status = status;
  b.updated_at = iso(Date.now());
};

/** Список бронирований с фильтром по статусу и пагинацией */
const listResponse = (
  request: Request,
  filter: (b: DemoBooking) => boolean,
) => {
  const q = query(request);
  const status = q.get('status');
  const items = bookings
    .filter(filter)
    .filter(
      b => !status || status.split(',').includes(b.status),
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
};

/** Действие над бронированием с проверкой роли и статуса */
const action = (
  path: string,
  role: 'owner' | 'renter' | 'any',
  allowed: BookingStatus[],
  run: (
    b: DemoBooking,
    body: Record<string, string>,
  ) => unknown,
) =>
  http.post(
    `${WEB}/rent/bookings/:id/${path}`,
    authed(async ({ params, request }) => {
      const b = findBooking(params.id as string);
      if (!b) return notFound();
      const isOwner = ownerOf(b) === ME;
      const isRenter = b.renter_id === ME;
      if (
        (role === 'owner' && !isOwner) ||
        (role === 'renter' && !isRenter) ||
        (!isOwner && !isRenter)
      ) {
        return fail(
          403,
          'FORBIDDEN',
          'Нет доступа к бронированию',
        );
      }
      if (!allowed.includes(b.status))
        return fail(
          409,
          'INVALID_STATUS',
          'Действие недоступно в текущем статусе',
        );
      const result = run(
        b,
        await readJson<Record<string, string>>(request),
      );
      // run может вернуть готовый ответ с ошибкой
      if (result instanceof Response) return result;
      return ok(result ?? toBookingItem(b, ME));
    }),
  );

export const bookingHandlers = [
  http.post(
    `${WEB}/rent/bookings`,
    authed(async ({ request }) => {
      const body = await readJson<{
        listing_id: string;
        quantity: number;
        start_time: string;
        end_time: string;
      }>(request);
      const l = findListing(body.listing_id);
      if (!l || l.status !== 'active') return notFound();
      if (l.owner_id === ME)
        return fail(
          400,
          'OWN_LISTING',
          'Нельзя арендовать своё объявление',
        );
      const start = new Date(body.start_time).getTime();
      const end = new Date(body.end_time).getTime();
      if (!(end > start))
        return fail(
          400,
          'VALIDATION_ERROR',
          'Время окончания должно быть позже начала',
        );
      const now = iso(Date.now());
      const b: DemoBooking = {
        booking_id: nextId('b'),
        listing_id: l.listing_id,
        renter_id: ME,
        quantity: body.quantity || 1,
        start_time: body.start_time,
        end_time: body.end_time,
        status: 'pending',
        cancelled_by: null,
        total_price: 0,
        created_at: now,
        updated_at: now,
        pending_extension: null,
      };
      recalcPrice(b);
      bookings.push(b);
      return ok(toBookingItem(b, ME), 201);
    }),
  ),

  // as-renter / as-owner должны быть выше /:id
  http.get(
    `${WEB}/rent/bookings/as-renter`,
    authed(({ request }) =>
      listResponse(request, b => b.renter_id === ME),
    ),
  ),
  http.get(
    `${WEB}/rent/bookings/as-owner`,
    authed(({ request }) =>
      listResponse(request, b => ownerOf(b) === ME),
    ),
  ),

  http.get(
    `${WEB}/rent/bookings/:id`,
    authed(({ params }) => {
      const b = findBooking(params.id as string);
      if (!b || (b.renter_id !== ME && ownerOf(b) !== ME))
        return notFound();
      return ok(toBookingItem(b, ME));
    }),
  ),

  action('approve', 'owner', ['pending'], b => {
    touch(
      b,
      new Date(b.start_time).getTime() <= Date.now()
        ? 'active'
        : 'approved',
    );
  }),

  action('reject', 'owner', ['pending'], b => {
    b.cancelled_by = 'owner';
    touch(b, 'rejected');
  }),

  action('cancel', 'any', ['pending', 'approved'], b => {
    b.cancelled_by =
      b.renter_id === ME ? 'renter' : 'owner';
    touch(b, 'cancelled');
  }),

  action('extension', 'renter', ['active'], (b, body) => {
    if (b.pending_extension)
      return fail(
        409,
        'EXTENSION_PENDING',
        'Запрос на продление уже отправлен',
      );
    if (
      !(new Date(body.new_end_time) > new Date(b.end_time))
    )
      return fail(
        400,
        'VALIDATION_ERROR',
        'Новое время должно быть позже текущего окончания',
      );
    const now = iso(Date.now());
    b.pending_extension = {
      id: nextId('ext'),
      booking_id: b.booking_id,
      new_end_time: body.new_end_time,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };
    touch(b);
    return b.pending_extension;
  }),

  action('extension/approve', 'owner', ['active'], b => {
    if (!b.pending_extension)
      return fail(
        409,
        'NO_EXTENSION',
        'Нет запроса на продление',
      );
    b.end_time = b.pending_extension.new_end_time;
    b.pending_extension = null;
    recalcPrice(b);
    touch(b);
  }),

  action('extension/reject', 'owner', ['active'], b => {
    const ext = b.pending_extension;
    if (!ext)
      return fail(
        409,
        'NO_EXTENSION',
        'Нет запроса на продление',
      );
    b.pending_extension = null;
    touch(b);
    return {
      ...ext,
      status: 'rejected',
      updated_at: iso(Date.now()),
    };
  }),

  action('no-show', 'owner', ['active'], b => {
    touch(b, 'no_show');
  }),

  http.post(
    `${WEB}/rent/bookings/:id/reviews`,
    authed(async ({ params, request }) => {
      const b = findBooking(params.id as string);
      if (!b) return notFound();
      if (b.status !== 'completed')
        return fail(
          409,
          'INVALID_STATUS',
          'Отзыв можно оставить после завершения аренды',
        );
      if (hasMyReview(b, ME))
        return fail(
          409,
          'ALREADY_REVIEWED',
          'Вы уже оставили отзыв',
        );
      const body = await readJson<{
        review_type: string;
        rating: number;
        comment: string;
      }>(request);
      // Отзыв об объявлении пишет арендатор, об арендаторе — владелец
      const allowed =
        (body.review_type === 'renter_to_listing' &&
          b.renter_id === ME) ||
        (body.review_type === 'owner_to_renter' &&
          ownerOf(b) === ME);
      if (!allowed)
        return fail(
          403,
          'FORBIDDEN',
          'Нет доступа к бронированию',
        );
      const review: BackendReview = {
        review_id: nextId('r'),
        booking_id: b.booking_id,
        listing_id: b.listing_id,
        author_id: ME,
        target_id:
          body.review_type === 'owner_to_renter'
            ? b.renter_id
            : ownerOf(b),
        review_type: body.review_type,
        rating: body.rating,
        comment: body.comment,
        created_at: iso(Date.now()),
        author_is_premium:
          findUser(ME)?.is_premium ?? false,
      };
      reviews.push(review);
      return ok(review, 201);
    }),
  ),
];
