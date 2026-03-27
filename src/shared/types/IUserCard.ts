import { IMediaType } from './IMediaType';

export interface IUserCard {
  id: number;
  name: string;
  avatar?: IMediaType;
}
