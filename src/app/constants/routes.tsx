import { IRouterType } from '@app-types/IRouterType.ts';
import {
  ChatPage,
  LoginPage,
  RentalsPage,
  ProfilePage,
  RegisterPage,
  RentedRentalsPage,
  RentPage,
  ReviewsPage,
  TestHome,
  HostedRentalsPage,
  UserChatsPage,
  UserRentPage,
} from '@pages';

export const routes: IRouterType[] = [
  { path: '/test-home', component: <TestHome /> },
  { path: '/login', component: <LoginPage /> },
  { path: '/register', component: <RegisterPage /> },
  { path: '/', component: <RentalsPage /> },
  { path: '/profile', component: <ProfilePage /> },
  { path: '/my-products', component: <HostedRentalsPage /> },
  { path: '/rent', component: <UserRentPage /> },
  { path: '/chats', component: <UserChatsPage /> },
  { path: '/chats/:chatId', component: <ChatPage /> },
  { path: '/rentals-page', component: <RentedRentalsPage /> },
  { path: '/rent-page/:id', component: <RentPage /> },
  { path: '/reviews-page', component: <ReviewsPage /> },
];
