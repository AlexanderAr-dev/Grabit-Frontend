import { FC } from 'react';
import { Map, Marker } from 'pigeon-maps';

interface MapAddressShowProps {
  coordinates: string;
  height?: number;
  zoom?: number;
}

const MapAddressShow: FC<MapAddressShowProps> = ({
  coordinates,
  height = 300,
  zoom = 14,
}) => {
  const parts = coordinates.split(',').map(item => Number(item.trim()));

  if (parts.length !== 2 || parts.some(isNaN)) return null;

  const center: [number, number] = [parts[0], parts[1]];

  return (
    <Map height={height} defaultCenter={center} defaultZoom={zoom}>
      <Marker width={50} anchor={center} />
    </Map>
  );
};

export default MapAddressShow;
