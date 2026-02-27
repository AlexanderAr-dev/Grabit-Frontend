export {};

declare global {
  namespace ymaps {
    class Map {
      constructor(
        element: HTMLElement,
        options: {
          center: [number, number];
          zoom: number;
          controls?: string[];
        }
      );

      geoObjects: {
        add: (object: Placemark) => void;
      };

      destroy(): void;
      setCenter(center: [number, number]): void;
    }

    class Placemark {
      constructor(
        coordinates: [number, number],
        properties?: Record<string, unknown>,
        options?: Record<string, unknown>
      );
    }

    function ready(callback: () => void): void;
  }

  interface Window {
    ymaps: typeof ymaps;
  }
}