export interface CityConfig {
  key: string;
  name: string;
  lat: number;
  lon: number;
  radius_km: number;
}

export const CITIES: CityConfig[] = [
  { key: 'moscow', name: 'Москва', lat: 55.7558, lon: 37.6173, radius_km: 50 },
  { key: 'saint_petersburg', name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351, radius_km: 40 },
  { key: 'novosibirsk', name: 'Новосибирск', lat: 54.9833, lon: 82.8964, radius_km: 30 },
  { key: 'yekaterinburg', name: 'Екатеринбург', lat: 56.8389, lon: 60.6057, radius_km: 30 },
  { key: 'kazan', name: 'Казань', lat: 55.7887, lon: 49.1221, radius_km: 25 },
  { key: 'nizhny_novgorod', name: 'Нижний Новгород', lat: 56.3269, lon: 44.0059, radius_km: 25 },
  { key: 'krasnoyarsk', name: 'Красноярск', lat: 56.0153, lon: 92.8932, radius_km: 25 },
  { key: 'chelyabinsk', name: 'Челябинск', lat: 55.1644, lon: 61.4368, radius_km: 25 },
  { key: 'ufa', name: 'Уфа', lat: 54.7388, lon: 55.9721, radius_km: 25 },
  { key: 'samara', name: 'Самара', lat: 53.1959, lon: 50.1474, radius_km: 25 },
  { key: 'krasnodar', name: 'Краснодар', lat: 45.0355, lon: 38.9753, radius_km: 25 },
  { key: 'rostov_on_don', name: 'Ростов-на-Дону', lat: 47.2357, lon: 39.7015, radius_km: 25 },
  { key: 'voronezh', name: 'Воронеж', lat: 51.6755, lon: 39.2088, radius_km: 20 },
  { key: 'volgograd', name: 'Волгоград', lat: 48.7194, lon: 44.5018, radius_km: 25 },
  { key: 'perm', name: 'Пермь', lat: 58.0105, lon: 56.2502, radius_km: 25 },
  { key: 'vladivostok', name: 'Владивосток', lat: 43.1332, lon: 131.9113, radius_km: 20 },
  { key: 'yaroslavl', name: 'Ярославль', lat: 57.6261, lon: 39.8845, radius_km: 20 },
  { key: 'sevastopol', name: 'Севастополь', lat: 44.6054, lon: 33.5221, radius_km: 20 },
  { key: 'stavropol', name: 'Ставрополь', lat: 45.0428, lon: 41.9734, radius_km: 20 },
  { key: 'tomsk', name: 'Томск', lat: 56.4977, lon: 84.9744, radius_km: 20 },
  { key: 'kemerovo', name: 'Кемерово', lat: 55.3346, lon: 86.0883, radius_km: 20 },
  { key: 'naberezhnye_chelny', name: 'Набережные Челны', lat: 55.7232, lon: 52.4126, radius_km: 20 },
  { key: 'orenburg', name: 'Оренбург', lat: 51.7727, lon: 55.1018, radius_km: 20 },
  { key: 'novokuznetsk', name: 'Новокузнецк', lat: 53.7596, lon: 87.1216, radius_km: 20 },
  { key: 'balashikha', name: 'Балашиха', lat: 55.7964, lon: 37.9381, radius_km: 15 },
  { key: 'ryazan', name: 'Рязань', lat: 54.6269, lon: 39.6916, radius_km: 20 },
  { key: 'astrakhan', name: 'Астрахань', lat: 46.3497, lon: 48.0408, radius_km: 20 },
  { key: 'penza', name: 'Пенза', lat: 53.2007, lon: 45.0046, radius_km: 20 },
  { key: 'lipetsk', name: 'Липецк', lat: 52.6088, lon: 39.5990, radius_km: 20 },
  { key: 'kaliningrad', name: 'Калининград', lat: 54.7065, lon: 20.5110, radius_km: 20 },
  { key: 'kirov', name: 'Киров', lat: 58.6035, lon: 49.6680, radius_km: 20 },
  { key: 'tula', name: 'Тула', lat: 54.1961, lon: 37.6182, radius_km: 20 },
  { key: 'ulan_ude', name: 'Улан-Удэ', lat: 51.8335, lon: 107.5848, radius_km: 20 },
  { key: 'sochi', name: 'Сочи', lat: 43.5853, lon: 39.7203, radius_km: 20 },
  { key: 'kursk', name: 'Курск', lat: 51.7373, lon: 36.1874, radius_km: 20 },
  { key: 'surgut', name: 'Сургут', lat: 61.2615, lon: 73.3969, radius_km: 20 },
  { key: 'tver', name: 'Тверь', lat: 56.8587, lon: 35.9176, radius_km: 20 },
  { key: 'magnitogorsk', name: 'Магнитогорск', lat: 53.4069, lon: 59.0740, radius_km: 20 },
  { key: 'bryansk', name: 'Брянск', lat: 53.2521, lon: 34.3717, radius_km: 20 },
  { key: 'vladimir', name: 'Владимир', lat: 56.1366, lon: 40.3966, radius_km: 20 },
  { key: 'belgorod', name: 'Белгород', lat: 50.5997, lon: 36.5902, radius_km: 20 },
  { key: 'nizhny_tagil', name: 'Нижний Тагил', lat: 57.9180, lon: 59.9719, radius_km: 20 },
  { key: 'arkhangelsk', name: 'Архангельск', lat: 64.5401, lon: 40.5433, radius_km: 20 },
  { key: 'saransk', name: 'Саранск', lat: 54.1838, lon: 45.1749, radius_km: 20 },
  { key: 'chita', name: 'Чита', lat: 52.0339, lon: 113.5013, radius_km: 20 },
  { key: 'ulyanovsk', name: 'Ульяновск', lat: 54.3282, lon: 48.3866, radius_km: 20 },
  { key: 'cheboksary', name: 'Чебоксары', lat: 56.1439, lon: 47.2489, radius_km: 20 },
];

export const CITY_MAP = Object.fromEntries(CITIES.map(c => [c.key, c]));
