import { RouterType } from '@app-types/routerType.ts';
import {
  ChatPage,
  LoginPage,
  MainPage,
  ProfilePage,
  RegisterPage,
  RentalsPage,
  TestHome,
  UserAdsPage,
  UserChatsPage,
  UserRentPage,
} from '@pages';

export const routes: RouterType[] = [
  { path: '/test-home', component: <TestHome /> },
  { path: '/login', component: <LoginPage /> },
  { path: '/register', component: <RegisterPage /> },
  { path: '/', component: <MainPage /> },
  { path: '/profile', component: <ProfilePage /> },
  { path: '/my-products', component: <UserAdsPage /> },
  { path: '/rent', component: <UserRentPage /> },
  { path: '/chats', component: <UserChatsPage /> },
  { path: '/chats/:chatId', component: <ChatPage /> },
  { path: '/rentals-page', component: <RentalsPage /> },
];
