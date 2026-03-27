import { MapAddressShow } from '@entities/map';
import { mockRentAd, RentPageInfo } from '@entities/rental';
import { mockReviews, ReviewsList } from '@entities/review';

export const RentPage = () => {
  return (
    <>
      <RentPageInfo listing={mockRentAd[0]} />
      <MapAddressShow coordinates="55.751574,37.573856" />
      <ReviewsList reviews={mockReviews} />
    </>
  );
};
