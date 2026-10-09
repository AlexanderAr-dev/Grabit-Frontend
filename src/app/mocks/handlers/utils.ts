import {
  delay,
  HttpResponse,
  type HttpResponseResolver,
} from 'msw';

import { adminApi } from '@features/admin/api/adminService';
import { API_URL } from '@shared/api';
import { demoAuth } from '@shared/config/demo';

export const WEB = API_URL;
export const ADMIN =
  adminApi.defaults.baseURL ??
  API_URL.replace('/web', '/admin');

/** Ответ в формате бэкенда: `{ ok, data }` */
export const ok = <T>(data: T, status = 200) =>
  HttpResponse.json({ ok: true, data }, { status });

export const fail = (
  status: number,
  error: string,
  text = error,
) =>
  HttpResponse.json({ ok: false, error, text }, { status });

export const notFound = () =>
  fail(404, 'NOT_FOUND', 'Не найдено');

// Небольшая задержка, чтобы в демо были видны скелетоны и состояния загрузки
const realistic = () => delay(150 + Math.random() * 250);

/** Публичный эндпоинт */
export const open =
  (resolver: HttpResponseResolver): HttpResponseResolver =>
  async info => {
    await realistic();
    return resolver(info);
  };

/** Эндпоинт только для авторизованных — без демо-входа отдаёт 401, как настоящий бэкенд */
export const authed =
  (resolver: HttpResponseResolver): HttpResponseResolver =>
  async info => {
    await realistic();
    if (!demoAuth.isLoggedIn())
      return fail(
        401,
        'UNAUTHORIZED',
        'Требуется авторизация',
      );
    return resolver(info);
  };

export const query = (request: Request) =>
  new URL(request.url).searchParams;

export const num = (
  value: string | null,
  fallback: number,
) => {
  const n = Number(value);
  return value !== null &&
    value !== '' &&
    Number.isFinite(n)
    ? n
    : fallback;
};

export const paginate = <T>(
  items: T[],
  page: number,
  pageSize: number,
) => ({
  items: items.slice(
    (page - 1) * pageSize,
    page * pageSize,
  ),
  total: items.length,
  page,
  page_size: pageSize,
});

/** axios сериализует массивы как `rating[]=5&rating[]=4` */
export const getAllParam = (
  params: URLSearchParams,
  name: string,
) => [
  ...params.getAll(name),
  ...params.getAll(`${name}[]`),
];

export const readJson = async <T>(
  request: Request,
): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
};
