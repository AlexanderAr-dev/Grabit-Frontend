import { FilterBar, SearchInput } from '@components';
import { CardList } from '@components/CardList.tsx';
import { Flex } from '@mantine/core';

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
