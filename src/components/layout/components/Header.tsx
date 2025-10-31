import { pagesAndIcons } from '@constants/pagesAndIcons.ts';
import { Box, Container, Grid, Text } from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';
import { List, NavItem } from '@ui';

export const Header = () => {
  return (
    <Grid>
      <Grid.Col span={2}>
        <Container pt={15}>
          <Text c="white" size={'lg'}>
            город:{' '}
            <Text span td="underline" inherit>
              Красноярск
            </Text>
          </Text>
        </Container>
      </Grid.Col>
      <Grid.Col span={8}>
        <Container pt={15}>
          <List
            align="center"
            direction="horizontal"
            gap={80}
            items={pagesAndIcons}
            renderItem={item => (
              <NavItem key={item.href} {...item} />
            )}
          />
        </Container>
      </Grid.Col>
      <Grid.Col span={2}>
        <Container pt={10}>
          <Box bg={'#FF8104'} px={15} py={5} bdrs="md">
            <NavItem
              title={'Пользователь'}
              href={'/profile'}
              icon={IconUserCircle}
              color={'white'}
            />
          </Box>
        </Container>
      </Grid.Col>
    </Grid>
  );
};
