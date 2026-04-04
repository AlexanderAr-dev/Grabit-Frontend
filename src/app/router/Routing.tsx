import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import { IRouterType } from '@shared/types';
import { PrivateRoute } from './PrivateRoute';

interface RoutingProps {
  routes: IRouterType[];
}

export const Routing: FC<RoutingProps> = ({ routes }) => {
  return (
    <Routes>
      {routes.map(({ path, component, private: isPrivate }) => (
        <Route
          key={path}
          path={path}
          element={
            isPrivate ? <PrivateRoute>{component}</PrivateRoute> : component
          }
        />
      ))}
    </Routes>
  );
};
