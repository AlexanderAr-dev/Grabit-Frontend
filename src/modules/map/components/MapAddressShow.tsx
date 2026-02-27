import { FC, useEffect, useRef } from 'react';

interface MapAddressShowProps {
  coordinates: string;
  height?: string;
  zoom?: number;
}

const MapAddressShow: FC<MapAddressShowProps> = ({
  coordinates,
  height = '400px',
  zoom = 14,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<ymaps.Map | null>(null);

  useEffect(() => {
    if (!coordinates || !window.ymaps || !mapRef.current)
      return;

    const parts = coordinates
      .split(',')
      .map(item => Number(item.trim()));

    if (parts.length !== 2 || parts.some(isNaN)) return;

    window.ymaps.ready(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

      const map = new window.ymaps.Map(mapRef.current!, {
        center: parts as [number, number],
        zoom,
        controls: [],
      });

      const placemark = new window.ymaps.Placemark(
        parts as [number, number],
      );

      map.geoObjects.add(placemark);

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
  }, [coordinates, zoom]);

  return (
    <div ref={mapRef} style={{ width: '100%', height }} />
  );
};

export default MapAddressShow;
