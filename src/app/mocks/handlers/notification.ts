import { http } from 'msw';

import {
  iso,
  notificationPrefs,
  notifications,
} from '../db';
import {
  authed,
  num,
  ok,
  paginate,
  query,
  readJson,
  WEB,
} from './utils';

const markRead = (ids?: string[]) => {
  const now = iso(Date.now());
  notifications
    .filter(n => !n.is_read && (!ids || ids.includes(n.id)))
    .forEach(n =>
      Object.assign(n, { is_read: true, read_at: now }),
    );
};

export const notificationHandlers = [
  http.get(
    `${WEB}/notifications`,
    authed(({ request }) => {
      const q = query(request);
      const items = notifications
        .filter(
          n => q.get('filter') !== 'unread' || !n.is_read,
        )
        .sort((a, b) =>
          b.created_at.localeCompare(a.created_at),
        );
      const { items: page, total } = paginate(
        items,
        num(q.get('page'), 1),
        num(q.get('page_size'), 20),
      );
      return ok({ items: page, total });
    }),
  ),

  http.get(
    `${WEB}/notifications/unread-count`,
    authed(() =>
      ok({
        count: notifications.filter(n => !n.is_read).length,
      }),
    ),
  ),

  http.post(
    `${WEB}/notifications/mark-read`,
    authed(async ({ request }) => {
      const { notification_ids } = await readJson<{
        notification_ids: string[];
      }>(request);
      markRead(notification_ids ?? []);
      return ok(null);
    }),
  ),

  http.post(
    `${WEB}/notifications/mark-all-read`,
    authed(() => {
      markRead();
      return ok(null);
    }),
  ),

  http.get(
    `${WEB}/notifications/preferences`,
    authed(() => ok(notificationPrefs)),
  ),

  http.put(
    `${WEB}/notifications/preferences`,
    authed(async ({ request }) => {
      Object.assign(
        notificationPrefs,
        await readJson<Partial<typeof notificationPrefs>>(
          request,
        ),
      );
      return ok(notificationPrefs);
    }),
  ),
];
