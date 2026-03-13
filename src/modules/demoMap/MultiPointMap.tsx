import { FC, useEffect, useRef } from "react";

interface Props {
  points: [number, number][];
}

const MultiPointMap: FC<Props> = ({ points }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ymaps.Map | null>(null);

  useEffect(() => {
    if (!window.ymaps || !ref.current || !points.length) return;

    window.ymaps.ready(() => {
      mapRef.current?.destroy();

      const map = new window.ymaps.Map(ref.current!, {
        center: points[0],
        zoom: 12,
      });

      points.forEach((point) => {
        const placemark = new window.ymaps.Placemark(point);
        map.geoObjects.add(placemark);
      });

      mapRef.current = map;
    });

    return () => mapRef.current?.destroy();
  }, [points]);

  return <div ref={ref} style={{ height: 400 }} />;
};

export default MultiPointMap;