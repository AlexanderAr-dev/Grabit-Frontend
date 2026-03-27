import { FC, useEffect, useRef } from 'react';

interface Props {
  coordinates: [number, number];
  zoom?: number;
}

const SinglePointMap: FC<Props> = ({ coordinates, zoom = 14 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ymaps.Map | null>(null);

  useEffect(() => {
    if (!window.ymaps || !ref.current) return;

    window.ymaps.ready(() => {
      mapRef.current?.destroy();

      const map = new window.ymaps.Map(ref.current!, {
        center: coordinates,
        zoom,
      });

      const placemark = new window.ymaps.Placemark(coordinates);
      map.geoObjects.add(placemark);
      mapRef.current = map;
    });

    return () => mapRef.current?.destroy();
  }, [coordinates, zoom]);

  return <div ref={ref} style={{ height: 400 }} />;
};

export default SinglePointMap;
