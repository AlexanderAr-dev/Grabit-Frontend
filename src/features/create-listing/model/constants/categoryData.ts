// ВРЕМЕННЫЙ ФАЙЛ — категории по типу объявления
// Каждый тип содержит 2+ варианта верхнего уровня

import { CategoryNode } from './Categories';
import { ListingType } from '../types/CreateListing';

export const categoriesByType: Record<ListingType, CategoryNode[]> = {
  item_rent: [
    {
      id: 'tools',
      name: 'Инструменты',
      children: [
        {
          id: 'power_tools',
          name: 'Электроинструменты',
          children: [
            { id: 'drills', name: 'Дрели' },
            { id: 'screwdrivers', name: 'Шуруповерты' },
            { id: 'grinders', name: 'Болгарки' },
          ],
        },
        {
          id: 'hand_tools',
          name: 'Ручные инструменты',
          children: [
            { id: 'hammers', name: 'Молотки' },
            { id: 'saws', name: 'Пилы' },
          ],
        },
      ],
    },
    {
      id: 'transport',
      name: 'Транспорт',
      children: [
        {
          id: 'bikes',
          name: 'Велосипеды',
          children: [
            { id: 'mountain', name: 'Горные' },
            { id: 'city', name: 'Городские' },
          ],
        },
        {
          id: 'scooters',
          name: 'Самокаты',
          children: [
            { id: 'electric', name: 'Электросамокаты' },
            { id: 'kick', name: 'Обычные' },
          ],
        },
      ],
    },
    {
      id: 'electronics',
      name: 'Электроника',
      children: [
        {
          id: 'cameras',
          name: 'Камеры',
          children: [
            { id: 'dslr', name: 'Зеркальные' },
            { id: 'action', name: 'Экшн-камеры' },
          ],
        },
        {
          id: 'gaming',
          name: 'Игры и консоли',
          children: [
            { id: 'consoles', name: 'Консоли' },
            { id: 'vr', name: 'VR-шлемы' },
          ],
        },
      ],
    },
    {
      id: 'sports',
      name: 'Спорт',
      children: [
        {
          id: 'winter',
          name: 'Зимний спорт',
          children: [
            { id: 'skis', name: 'Лыжи' },
            { id: 'snowboards', name: 'Сноуборды' },
          ],
        },
        {
          id: 'water',
          name: 'Водный спорт',
          children: [
            { id: 'surfboards', name: 'Сёрфборды' },
            { id: 'kayaks', name: 'Каяки' },
          ],
        },
      ],
    },
  ],

  service: [
    {
      id: 'repair',
      name: 'Ремонт и строительство',
      children: [
        {
          id: 'plumbing',
          name: 'Сантехника',
          children: [
            { id: 'plumbing_repair', name: 'Ремонт сантехники' },
            { id: 'pipe_install', name: 'Прокладка труб' },
          ],
        },
        {
          id: 'electrical',
          name: 'Электрика',
          children: [
            { id: 'wiring', name: 'Проводка' },
            { id: 'electrician_call', name: 'Вызов электрика' },
          ],
        },
      ],
    },
    {
      id: 'beauty',
      name: 'Красота и уход',
      children: [
        {
          id: 'haircut',
          name: 'Стрижка',
          children: [
            { id: 'mens_cut', name: 'Мужская' },
            { id: 'womens_cut', name: 'Женская' },
          ],
        },
        {
          id: 'massage',
          name: 'Массаж',
          children: [
            { id: 'relaxing', name: 'Расслабляющий' },
            { id: 'sports_massage', name: 'Спортивный' },
          ],
        },
      ],
    },
    {
      id: 'lessons',
      name: 'Обучение',
      children: [
        {
          id: 'music',
          name: 'Музыка',
          children: [
            { id: 'guitar', name: 'Гитара' },
            { id: 'piano', name: 'Фортепиано' },
          ],
        },
        {
          id: 'languages',
          name: 'Языки',
          children: [
            { id: 'english', name: 'Английский' },
            { id: 'chinese', name: 'Китайский' },
          ],
        },
      ],
    },
  ],

  space: [
    {
      id: 'apartments',
      name: 'Квартиры',
      children: [
        {
          id: 'studio',
          name: 'Студии',
          children: [
            { id: 'studio_central', name: 'В центре' },
            { id: 'studio_suburbs', name: 'На окраине' },
          ],
        },
        {
          id: 'multiroom',
          name: 'Многокомнатные',
          children: [
            { id: 'two_room', name: '2 комнаты' },
            { id: 'three_room', name: '3 комнаты' },
          ],
        },
      ],
    },
    {
      id: 'offices',
      name: 'Офисы и коворкинги',
      children: [
        {
          id: 'coworking',
          name: 'Коворкинг',
          children: [
            { id: 'hot_desk', name: 'Горячий стол' },
            { id: 'fixed_desk', name: 'Постоянное место' },
          ],
        },
        {
          id: 'meeting_room',
          name: 'Переговорные',
          children: [
            { id: 'small_meeting', name: 'До 5 человек' },
            { id: 'large_meeting', name: 'До 20 человек' },
          ],
        },
      ],
    },
    {
      id: 'events',
      name: 'Площадки для мероприятий',
      children: [
        {
          id: 'party',
          name: 'Вечеринки',
          children: [
            { id: 'party_small', name: 'До 20 человек' },
            { id: 'party_large', name: 'До 100 человек' },
          ],
        },
        {
          id: 'photo_studio',
          name: 'Фотостудии',
          children: [
            { id: 'cyclorama', name: 'С циклорамой' },
            { id: 'themed', name: 'Тематические' },
          ],
        },
      ],
    },
  ],
};
