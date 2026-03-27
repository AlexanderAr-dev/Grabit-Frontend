import { useState } from 'react';
import { Paper, Stack, Title } from '@mantine/core';

import MultiPointMap from './MultiPointMap';
import SearchMap from './SearchMap';
import SinglePointMap from './SinglePointMap';

export default function MapDemoPage() {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  const single: [number, number] = [55.751244, 37.618423];
  const multi: [number, number][] = [
    [55.751244, 37.618423],
    [55.761244, 37.628423],
    [55.741244, 37.608423],
  ];

  return (
    <Stack p="lg">
      <Paper p="md">
        <Title order={4}>Single point</Title>
        <SinglePointMap coordinates={single} />
      </Paper>

      <Paper p="md">
        <Title order={4}>Multiple points</Title>
        <MultiPointMap points={multi} />
      </Paper>

      <Paper p="md">
        <Title order={4}>Search location</Title>
        <SearchMap onSelect={setCoords} />
        {coords && (
          <div>
            <div>Lat: {coords[0]}</div>
            <div>Lng: {coords[1]}</div>
          </div>
        )}
      </Paper>
    </Stack>
  );
}
