import { IRouterType } from '../types/IRouterType';
import { CreateListingPage } from '@features/create-listing';
import { MapDemoPage } from '@widgets/demo-map';
import {
  ChatPage,
  CreateRentalPage,
  HostedRentalsPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  RentalsPage,
  RentedRentalsPage,
  RentPage,
  ReviewsPage,
  TestHome,
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
  { path: '/create-rental', component: <CreateRentalPage /> },
  { path: '/demo-map-page', component: <MapDemoPage /> },
  { path: '/demo-create-page', component: <CreateListingPage /> },
];
