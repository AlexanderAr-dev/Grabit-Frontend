import { FC } from 'react';

import { AppProviders } from './app/providers';
import { AppLayout } from '@widgets/app-layout';

const App: FC = () => (
  <AppProviders>
    <AppLayout />
  </AppProviders>
);

export default App;
