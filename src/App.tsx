import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppProviders } from './app/providers';
import { DemoBadge } from './app/mocks/DemoBadge';
import { AdminApp } from '@features/admin';
import { IS_DEMO } from '@shared/config/demo';
import { AppLayout } from '@widgets/app-layout';

const App: FC = () => (
  <AppProviders>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
    {IS_DEMO && <DemoBadge />}
  </AppProviders>
);

export default App;
