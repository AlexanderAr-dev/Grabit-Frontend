import { RouterType } from '@app-types/routerType.ts';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  TestHome,
} from '@pages';

export const routes: RouterType[] = [
  { path: '/test-home', component: <TestHome /> },
  { path: '/login', component: <LoginPage /> },
  { path: '/register', component: <RegisterPage /> },
  { path: '/home', component: <HomePage /> },
];
