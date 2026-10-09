import { setupWorker } from 'msw/browser';

import {
  DEMO_LOGIN_PARAM,
  demoAuth,
} from '@shared/config/demo';

import { adminHandlers } from './handlers/admin';
import { bookingHandlers } from './handlers/booking';
import { chatHandlers } from './handlers/chat';
import { notificationHandlers } from './handlers/notification';
import { rentHandlers } from './handlers/rent';
import { userHandlers } from './handlers/user';

export const worker = setupWorker(
  ...userHandlers,
  ...rentHandlers,
  ...bookingHandlers,
  ...chatHandlers,
  ...notificationHandlers,
  ...adminHandlers,
);

/** Запускает моки до первого рендера и обрабатывает «вход» после редиректа с ?demo_login=1 */
export async function enableDemoMode() {
  const url = new URL(window.location.href);
  if (url.searchParams.has(DEMO_LOGIN_PARAM)) {
    demoAuth.login();
    url.searchParams.delete(DEMO_LOGIN_PARAM);
    window.history.replaceState(
      null,
      '',
      url.pathname + url.search + url.hash,
    );
  }

  await worker.start({
    // Карты, шрифты и картинки ходят в сеть как обычно
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
}
