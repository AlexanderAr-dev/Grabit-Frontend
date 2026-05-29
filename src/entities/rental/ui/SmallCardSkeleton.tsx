import { Card, Skeleton } from '@mantine/core';

export const SmallCardSkeleton = () => {
  return (
    <Card shadow="md" radius="lg" style={{ overflow: 'hidden' }}>
      <Card.Section>
        <Skeleton height={200} radius={0} />
      </Card.Section>
      <div style={{ padding: '14px 16px' }}>
        <Skeleton height={16} width="60%" mb={8} />
        <Skeleton height={22} width="80%" mb={6} />
        <Skeleton height={18} width="40%" mb={6} />
        <Skeleton height={14} width="70%" />
      </div>
    </Card>
  );
};
