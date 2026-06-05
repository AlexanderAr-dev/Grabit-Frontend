import { Card, Flex, Skeleton, Stack } from '@mantine/core';

export const HostedRentalCardSkeleton = () => (
  <Card shadow="md" radius="lg" withBorder style={{ overflow: 'hidden' }}>
    <Flex direction="row" gap="md">
      <Skeleton height={230} width={230} radius="md" />
      <Stack gap={10} style={{ flex: 1 }}>
        <Skeleton height={22} width="70%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="80%" />
        <Skeleton height={20} width="30%" mt={8} />
        <Skeleton height={14} width="50%" />
        <Skeleton height={32} width={120} mt="auto" radius="md" />
      </Stack>
    </Flex>
  </Card>
);
