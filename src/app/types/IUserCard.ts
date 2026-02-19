import { IMediaType } from '@app-types/IMediaType.ts';

export interface IUserCard {
  id: number;
  name: string;
  avatar?: IMediaType;
}
