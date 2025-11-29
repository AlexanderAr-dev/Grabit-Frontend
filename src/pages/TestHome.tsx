import { IconSearch } from '@tabler/icons-react';
import { Button, NavItem } from '@ui';

export const TestHome = () => {
  return (
    <>
      <p>Это тестовая страница</p>
      <Button>Привет</Button>
      <div>
        <NavItem
          href={''}
          icon={IconSearch}
          title="Поиск"
        />
        <NavItem
          href={''}
          icon={IconSearch}
          title="Мое"
        />
        <NavItem
          href={''}
          icon={IconSearch}
          title="Аренда"
        />
        <NavItem
          href={''}
          icon={IconSearch}
          title="Чаты"
        />
      </div>

    </>
  );
};
