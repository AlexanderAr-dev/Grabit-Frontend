export { useIsAdmin } from './model/useIsAdmin';

import { Route, Routes } from 'react-router-dom';

import { AdminLayout } from './components/AdminLayout';
import { BookingsPage } from './pages/BookingsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ListingsPage } from './pages/ListingsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { UsersPage } from './pages/UsersPage';

export function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
      </Route>
    </Routes>
  );
}
