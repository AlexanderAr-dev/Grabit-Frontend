import { useParams } from 'react-router-dom';

import { PublicProfile } from '@entities/user';

export const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) return null;

  return <PublicProfile userId={userId} />;
};
