import { Card, Group, Skeleton, Stack } from '@mantine/core';

export const BookingCardSkeleton = () => (
  <Card shadow="sm" radius="lg" withBorder mb={16} style={{ overflow: 'hidden' }}>
    <Group align="flex-start" gap="md" wrap="nowrap">
      <Skeleton height={160} width={120} radius="md" style={{ flexShrink: 0 }} />
      <Stack gap={10} style={{ flex: 1 }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Skeleton height={22} width="60%" />
          <Skeleton height={26} width={90} radius="md" />
        </Group>
        <Skeleton height={16} width="75%" />
        <Skeleton height={18} width="30%" />
        <Skeleton height={36} width={180} radius="md" mt={4} />
      </Stack>
    </Group>
  </Card>
);
