import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  Group,
  Text,
} from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';

import { navigationItems } from '@shared/config';
import { List, NavItem, ThemeToggle } from '@shared/ui';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveItem = (href: string) => location.pathname === href;

  return (
    <Grid>
      <Grid.Col span={2}>
        <Container pt={15}>
          <Text size="lg">
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
            items={navigationItems}
            renderItem={item => (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActiveItem(item.href)}
              />
            )}
          />
        </Container>
      </Grid.Col>
      <Grid.Col span={2}>
        <Container pt={10}>
          <Group justify="flex-end" gap="md">
            <ThemeToggle />
            <Button
              leftSection={<IconUserCircle size={22} />}
              bg="#FF8104"
              px={15}
              py={5}
              bdrs="md"
              onClick={() => navigate('/profile')}
            >
              <Text size="lg" fw={500} c="white">
                Пользователь
              </Text>
            </Button>
          </Group>
        </Container>
      </Grid.Col>
    </Grid>
  );
};
