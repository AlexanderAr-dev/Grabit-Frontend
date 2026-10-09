import { createContext, ReactNode, useContext, useState } from 'react';

import { CITY_MAP, CityConfig, CITIES } from '@shared/config/cities';

const STORAGE_KEY = 'grabit_selected_city';

function loadCity(): CityConfig {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    if (key && CITY_MAP[key]) return CITY_MAP[key];
  } catch {
    // ignore
  }
  return CITY_MAP['krasnoyarsk'];
}

interface CityContextValue {
  city: CityConfig;
  setCity: (key: string) => void;
  cities: CityConfig[];
}

const CityContext = createContext<CityContextValue | null>(null);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState<CityConfig>(loadCity);

  const setCity = (key: string) => {
    const found = CITY_MAP[key];
    if (!found) return;
    setCityState(found);
    try { localStorage.setItem(STORAGE_KEY, key); } catch { /* ignore */ }
  };

  return (
    <CityContext.Provider value={{ city, setCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
};
