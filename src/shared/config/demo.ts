// Демо-режим: `npm run dev:demo` / `npm run build:demo`.
// Бэкенд подменяется MSW (src/app/mocks), вход через Keycloak — флагом в localStorage.
export const IS_DEMO = import.meta.env.MODE === 'demo';

const DEMO_AUTH_KEY = 'grabit_demo_auth';
export const DEMO_LOGIN_PARAM = 'demo_login';

export const demoAuth = {
  isLoggedIn(): boolean {
    try {
      return localStorage.getItem(DEMO_AUTH_KEY) === '1';
    } catch {
      return false;
    }
  },
  login() {
    try {
      localStorage.setItem(DEMO_AUTH_KEY, '1');
    } catch {
      // ignore
    }
  },
  logout() {
    try {
      localStorage.removeItem(DEMO_AUTH_KEY);
    } catch {
      // ignore
    }
  },
  /** Вместо редиректа на Keycloak — возврат на текущую страницу с флагом входа */
  getLoginUrl(): string {
    const url = new URL(window.location.href);
    url.searchParams.set(DEMO_LOGIN_PARAM, '1');
    return url.pathname + url.search;
  },
};
