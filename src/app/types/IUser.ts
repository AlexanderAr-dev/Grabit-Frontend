export interface IUser {
  id: string;
  login: string;
  email: string;
  name: string;
  description: string;
  avatar?: string;
  stats: {
    reviews: number;
    rating: number | string;
    offers: number;
  };
}

export interface UserProps {
  user?: IUser;
}
