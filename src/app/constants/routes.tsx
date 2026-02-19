import { IRouterType } from '@app-types/IRouterType.ts';
import {
  ChatPage,
  LoginPage,
  MainPage,
  ProfilePage,
  RegisterPage,
  RentalsPage,
  RentPage,
  ReviewsPage,
  TestHome,
  UserAdsPage,
  UserChatsPage,
  UserRentPage,
} from '@pages';

export const routes: IRouterType[] = [
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
  { path: '/rent-page/:id', component: <RentPage /> },
  { path: '/reviews-page', component: <ReviewsPage /> },
];
