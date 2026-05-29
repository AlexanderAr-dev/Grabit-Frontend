import { CreateListingPage } from '@features/create-listing';
import {
  ChatPage,
  CreateRentalPage,
  EditListingCalendarPage,
  EditListingInfoPage,
  HostedRentalsPage,
  NotFoundPage,
  ProfilePage,
  PublicProfilePage,
  RentalsPage,
  RentedRentalsPage,
  RentPage,
  ReviewsPage,
  TestHome,
  UserChatsPage,
  UserRentPage,
} from '@pages';
import { IRouterType } from '@shared/types';

export const routes: IRouterType[] = [
  { path: '/test-home', component: <TestHome /> },
  { path: '/', component: <RentalsPage /> },
  { path: '/rent-page/:id', component: <RentPage /> },
  { path: '/reviews-page', component: <ReviewsPage /> },
  { path: '/users/:userId', component: <PublicProfilePage /> },
  {
    path: '/profile',
    component: <ProfilePage />,
    private: true,
  },
  {
    path: '/my-products',
    component: <HostedRentalsPage />,
    private: true,
  },
  {
    path: '/rent',
    component: <UserRentPage />,
    private: true,
  },
  {
    path: '/chats',
    component: <UserChatsPage />,
    private: true,
  },
  {
    path: '/chats/:chatId',
    component: <ChatPage />,
    private: true,
  },
  {
    path: '/rentals-page',
    component: <RentedRentalsPage />,
    private: true,
  },
  {
    path: '/create-rental',
    component: <CreateRentalPage />,
    private: true,
  },
  {
    path: '/create-listing',
    component: <CreateListingPage />,
    private: true,
  },
  {
    path: '/edit-listing/:id',
    component: <EditListingInfoPage />,
    private: true,
  },
  {
    path: '/edit-listing/:id/calendar',
    component: <EditListingCalendarPage />,
    private: true,
  },
  { path: '*', component: <NotFoundPage /> },
];
