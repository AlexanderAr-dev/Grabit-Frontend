import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppProviders } from './app/providers';
import { AdminApp } from '@features/admin';
import { AppLayout } from '@widgets/app-layout';

const App: FC = () => (
  <AppProviders>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  </AppProviders>
);

export default App;
