import { ReactNode } from 'react';

export interface IRouterType {
  path: string;
  component: ReactNode;
  private?: boolean;
}
