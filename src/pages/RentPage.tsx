import { Box, Flex, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

import { MapAddressShow } from '@entities/map';
import { mockRentAd, RentPageInfo } from '@entities/rental';
import { mockReviews, ReviewsList } from '@entities/review';

export const RentPage = () => {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);

  const listing = mockRentAd.find(a => a.id === numId) ?? mockRentAd[0];

  return (
    <>
      <RentPageInfo listing={listing} />
      <Flex justify="center" mb={30}>
        <Box style={{ width: 832 }}>
          <Text size="xl" fw={600} mb={8}>Расположение</Text>
          <MapAddressShow coordinates={listing.coordinates ?? '56.0153,92.8932'} />
        </Box>
      </Flex>
      <ReviewsList reviews={mockReviews} />
    </>
  );
};
