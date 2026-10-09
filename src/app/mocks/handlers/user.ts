import { http } from 'msw';

import type {
  CompleteProfileData,
  UpdateProfileData,
} from '@shared/api';
import { demoAuth } from '@shared/config/demo';

import {
  DAY,
  findUser,
  iso,
  ME,
  toBackendUser,
} from '../db';
import {
  authed,
  fail,
  notFound,
  ok,
  open,
  readJson,
  WEB,
} from './utils';

const PLAN_DAYS = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
} as const;

const me = () => findUser(ME)!;

export const userHandlers = [
  http.get(
    `${WEB}/users/me`,
    authed(() => ok(toBackendUser(me()))),
  ),

  http.post(
    `${WEB}/users/me/profile/complete`,
    authed(async ({ request }) => {
      Object.assign(
        me(),
        await readJson<CompleteProfileData>(request),
        { profile_complete: true },
      );
      return ok(toBackendUser(me()));
    }),
  ),

  http.put(
    `${WEB}/users/me/profile`,
    authed(async ({ request }) => {
      Object.assign(
        me(),
        await readJson<UpdateProfileData>(request),
      );
      return ok(toBackendUser(me()));
    }),
  ),

  http.post(
    `${WEB}/users/me/avatar`,
    authed(async ({ request }) => {
      const file = (await request.formData()).get('avatar');
      if (!(file instanceof File))
        return fail(400, 'VALIDATION_ERROR', 'Нет файла');
      me().avatar_url = URL.createObjectURL(file);
      return ok({ avatar_url: me().avatar_url });
    }),
  ),

  http.delete(
    `${WEB}/users/me/avatar`,
    authed(() => {
      me().avatar_url = undefined;
      return ok(null);
    }),
  ),

  http.get(
    `${WEB}/users/id/:id`,
    open(({ params }) => {
      const user = findUser(params.id as string);
      if (!user) return notFound();
      // Публичный профиль — без контактов
      return ok({
        ...toBackendUser(user),
        email: undefined,
        phone: undefined,
      });
    }),
  ),

  http.post(
    `${WEB}/subscriptions`,
    authed(async ({ request }) => {
      const { plan } = await readJson<{
        plan: keyof typeof PLAN_DAYS;
      }>(request);
      const user = me();
      user.is_premium = true;
      user.subscription_expires_at = iso(
        Date.now() + (PLAN_DAYS[plan] ?? 30) * DAY,
      );
      return ok({
        subscription_tier: 'premium',
        subscription_expires_at:
          user.subscription_expires_at,
      });
    }),
  ),

  http.post(
    `${WEB}/sso/logout`,
    open(() => {
      demoAuth.logout();
      // Пустой logout_url — фронт не пытается ходить в Keycloak
      return ok({ logout_url: '' });
    }),
  ),
];
