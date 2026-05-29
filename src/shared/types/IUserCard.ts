import { IMediaType } from './IMediaType';

export interface IUserCard {
  id: number;
  name: string | null;
  avatar?: IMediaType;
}
