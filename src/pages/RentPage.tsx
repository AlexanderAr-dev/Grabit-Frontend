import { RentPageInfo } from '@modules/rent-ads';
import { mockRentAd } from '@modules/rent-ads/constants/mockRentAd.ts';
import { ReviewsList } from '@modules/reviews/components/ReviewsList.tsx';
import { mockReviews } from '@modules/reviews/constants/mockReviews.ts';

export const RentPage = () => {
  // const { id } = useParams();
  // const { data: rent, isLoading } = useGetRentInfoById(
  //   Number(id),
  // );
  // console.log(rent);
  //
  // if (isLoading) return <div>Loading...</div>;
  // if (!rent) return null;

  return (
    <>
      <RentPageInfo listing={mockRentAd[0]} />
      {/*<Map address={listing.address} />*/}
      {/*<Booking listingId={listing.id} />*/}
      <ReviewsList reviews={mockReviews} />
    </>
  );
};
