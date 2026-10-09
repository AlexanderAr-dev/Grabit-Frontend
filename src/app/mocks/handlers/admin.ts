import { http, HttpResponse } from 'msw';

import type {
  AdminBooking,
  AdminListing,
  AdminReview,
  AdminStats,
} from '@features/admin/api/adminService';

import {
  bookings,
  categories,
  DAY,
  findListing,
  iso,
  listingRating,
  listings,
  nextId,
  reviews,
  toAdminCategory,
  toAdminUser,
  users,
} from '../db';
import {
  ADMIN,
  authed,
  notFound,
  num,
  query,
  readJson,
} from './utils';

const PLAN_DAYS = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
} as const;

/** Админка работает в формате react-admin: массив + заголовок Content-Range */
const ranged = <T>(request: Request, items: T[]) => {
  const q = query(request);
  const start = num(q.get('_start'), 0);
  const end = num(q.get('_end'), 10);
  return HttpResponse.json(items.slice(start, end), {
    headers: {
      'Content-Range': `items ${start}-${Math.max(start, end - 1)}/${items.length}`,
      'Access-Control-Expose-Headers': 'Content-Range',
    },
  });
};

const json = (data: unknown) =>
  HttpResponse.json(data as Record<string, unknown>);
const empty = () => new HttpResponse(null, { status: 204 });

const byNewest = <T extends { created_at: string }>(
  a: T,
  b: T,
) => b.created_at.localeCompare(a.created_at);

export const adminHandlers = [
  http.get(
    `${ADMIN}/stats`,
    authed(() => {
      const count = <T>(
        list: T[],
        pick: (x: T) => string,
        key: string,
      ) => list.filter(x => pick(x) === key).length;
      const stats: AdminStats = {
        total_users: users.length,
        new_users_7d: users.filter(
          u =>
            Date.now() - new Date(u.created_at).getTime() <
            7 * DAY,
        ).length,
        blocked_users: users.filter(u => u.blocked).length,
        deleted_users: 0,
        listings_by_status: {
          active: count(listings, l => l.status, 'active'),
          paused: count(listings, l => l.status, 'paused'),
          deleted: count(
            listings,
            l => l.status,
            'deleted',
          ),
        },
        bookings_by_status: {
          pending: count(
            bookings,
            b => b.status,
            'pending',
          ),
          approved: count(
            bookings,
            b => b.status,
            'approved',
          ),
          active: count(bookings, b => b.status, 'active'),
          completed: count(
            bookings,
            b => b.status,
            'completed',
          ),
          cancelled: count(
            bookings,
            b => b.status,
            'cancelled',
          ),
        },
        total_revenue: bookings
          .filter(b => b.status === 'completed')
          .reduce((s, b) => s + b.total_price, 0),
        total_reviews: reviews.length,
      };
      return json(stats);
    }),
  ),

  // ---- Пользователи ----
  http.get(
    `${ADMIN}/users`,
    authed(({ request }) =>
      ranged(
        request,
        [...users].sort(byNewest).map(toAdminUser),
      ),
    ),
  ),

  ...(['block', 'unblock'] as const).map(action =>
    http.put(
      `${ADMIN}/users/:id/${action}`,
      authed(({ params }) => {
        const user = users.find(u => u.id === params.id);
        if (!user) return notFound();
        user.blocked = action === 'block';
        return empty();
      }),
    ),
  ),

  http.put(
    `${ADMIN}/users/:id/premium`,
    authed(async ({ params, request }) => {
      const user = users.find(u => u.id === params.id);
      if (!user) return notFound();
      const { plan } = await readJson<{
        plan: keyof typeof PLAN_DAYS | 'free';
      }>(request);
      user.is_premium = plan !== 'free';
      user.subscription_expires_at =
        plan === 'free'
          ? undefined
          : iso(Date.now() + PLAN_DAYS[plan] * DAY);
      return empty();
    }),
  ),

  // ---- Объявления ----
  http.get(
    `${ADMIN}/listings`,
    authed(({ request }) =>
      ranged(
        request,
        [...listings].sort(byNewest).map(
          (l): AdminListing => ({
            listing_id: l.listing_id,
            owner_id: l.owner_id,
            title: l.title,
            price_per_hour: l.price_per_hour,
            status: l.status,
            ...listingRating(l.listing_id),
            created_at: l.created_at,
          }),
        ),
      ),
    ),
  ),

  http.delete(
    `${ADMIN}/listings/:id`,
    authed(({ params }) => {
      const l = findListing(params.id as string);
      if (!l) return notFound();
      l.status = 'deleted';
      return empty();
    }),
  ),

  // ---- Бронирования ----
  http.get(
    `${ADMIN}/bookings`,
    authed(({ request }) => {
      const status = query(request).get('status');
      const items = bookings
        .filter(b => !status || b.status === status)
        .sort(byNewest)
        .map(
          (b): AdminBooking => ({
            booking_id: b.booking_id,
            listing: {
              listing_id: b.listing_id,
              title: findListing(b.listing_id)?.title,
            },
            renter_id: b.renter_id,
            status: b.status,
            total_price: b.total_price,
            start_time: b.start_time,
            end_time: b.end_time,
            created_at: b.created_at,
          }),
        );
      return ranged(request, items);
    }),
  ),

  // ---- Отзывы ----
  http.get(
    `${ADMIN}/reviews`,
    authed(({ request }) =>
      ranged(
        request,
        [...reviews].sort(byNewest).map(
          (r): AdminReview => ({
            id: r.review_id,
            booking_id: r.booking_id,
            listing_id: r.listing_id,
            author_id: r.author_id,
            review_type:
              r.review_type as AdminReview['review_type'],
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
          }),
        ),
      ),
    ),
  ),

  http.delete(
    `${ADMIN}/reviews/:id`,
    authed(({ params }) => {
      const index = reviews.findIndex(
        r => r.review_id === params.id,
      );
      if (index === -1) return notFound();
      reviews.splice(index, 1);
      return empty();
    }),
  ),

  // ---- Категории ----
  http.get(
    `${ADMIN}/categories`,
    authed(() => json(categories.map(toAdminCategory))),
  ),

  http.post(
    `${ADMIN}/categories`,
    authed(async ({ request }) => {
      const body = await readJson<{
        name_ru: string;
        name_en: string;
        parent_id?: number;
        sort_order?: number;
      }>(request);
      const category = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        parent_id: body.parent_id,
        name_ru: body.name_ru,
        name_en: body.name_en,
        slug: nextId('category'),
        sort_order:
          body.sort_order ?? categories.length + 1,
      };
      categories.push(category);
      return json(toAdminCategory(category));
    }),
  ),

  http.put(
    `${ADMIN}/categories/:id`,
    authed(async ({ params, request }) => {
      const category = categories.find(
        c => c.id === Number(params.id),
      );
      if (!category) return notFound();
      Object.assign(
        category,
        await readJson<{
          name_ru: string;
          name_en: string;
        }>(request),
      );
      return json(toAdminCategory(category));
    }),
  ),

  http.post(
    `${ADMIN}/categories/:id/migrate`,
    authed(async ({ params, request }) => {
      const { to_id } = await readJson<{ to_id: number }>(
        request,
      );
      if (!categories.some(c => c.id === to_id))
        return notFound();
      const moved = listings.filter(
        l => l.category_id === Number(params.id),
      );
      moved.forEach(l => (l.category_id = to_id));
      return json({ migrated_count: moved.length });
    }),
  ),
];
