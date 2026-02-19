import { FilterBar, SearchInput } from '@components';
import { Flex } from '@mantine/core';
import { CardList } from '@modules/rent-ads/components/CardList.tsx';

export const MainPage = () => {
  return (
    <>
      <Flex
        gap="md"
        justify="center"
        align="center"
        direction="column"
      >
        <SearchInput />
        <FilterBar />
      </Flex>
      <div
        style={{
          padding: 20,
          minHeight: '100vh',
        }}
      >
        <CardList />
      </div>
    </>
  );
};
