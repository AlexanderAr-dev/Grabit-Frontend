import { FC, useEffect, useRef } from 'react';

interface Props {
  onSelect: (coords: [number, number]) => void;
}

const SearchMap: FC<Props> = ({ onSelect }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ymaps.Map | null>(null);
  const placemarkRef = useRef<ymaps.Placemark | null>(null);

  useEffect(() => {
    if (!window.ymaps || !ref.current) return;

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(ref.current!, {
        center: [55.75, 37.57],
        zoom: 9,
        controls: ['searchControl'],
      });

      const placemark = new window.ymaps.Placemark(
        [55.75, 37.57],
        {},
        { draggable: true },
      );

      map.geoObjects.add(placemark);

      map.events.add('click', (e: unknown) => {
        const event = e as { get: (key: string) => [number, number] };
        const coords = event.get('coords');
        placemark.geometry.setCoordinates(coords);
        onSelect(coords);
      });

      placemark.events.add('dragend', () => {
        const coords = placemark.geometry.getCoordinates();
        onSelect(coords);
      });

      mapRef.current = map;
      placemarkRef.current = placemark;
    });

    return () => mapRef.current?.destroy();
  }, [onSelect]);

  return <div ref={ref} style={{ height: 400 }} />;
};

export default SearchMap;
