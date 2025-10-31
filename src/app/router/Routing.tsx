import { FC, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

export interface RouterType {
  path: string;
  component: ReactNode;
}

interface RoutingProps {
  routes: RouterType[];
}

export const Routing: FC<RoutingProps> = ({ routes }) => {
  return (
    <Routes>
      {routes.map(({ path, component }) => (
        <Route key={path} path={path} element={component} />
      ))}
    </Routes>
  );
};
