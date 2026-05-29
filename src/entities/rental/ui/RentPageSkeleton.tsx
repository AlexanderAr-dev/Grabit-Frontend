import { Box, Card, Flex, SimpleGrid, Skeleton, Stack } from '@mantine/core';

export const RentPageSkeleton = () => {
  return (
    <>
      <Flex
        mih={50}
        gap="xl"
        justify="center"
        align="center"
        direction="row"
        style={{ border: '1px solid #e9ecef', borderRadius: 10, padding: 16 }}
      >
        <Skeleton height={340} width={400} radius="md" />

        <Card padding="lg" radius="md" style={{ maxWidth: 400, width: '100%' }}>
          <Stack gap="md">
            <Skeleton height={14} width="30%" />
            <Skeleton height={28} width="90%" />
            <Flex justify="space-between">
              <Stack gap={6} style={{ width: '45%' }}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={14} width="80%" />
              </Stack>
              <Stack gap={6} style={{ width: '45%' }}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={14} width="80%" />
              </Stack>
            </Flex>
            <Skeleton height={14} width="70%" />
            <Skeleton height={14} width="50%" />
            <Flex gap="md" align="center">
              <Skeleton height={50} width={50} radius="xl" />
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="40%" />
              </Stack>
            </Flex>
            <Skeleton height={40} radius="md" />
          </Stack>
        </Card>
      </Flex>

      <Flex justify="center" mt={20}>
        <Box style={{ width: 832 }}>
          <Flex gap="xl" mb={30}>
            <Stack gap={8} style={{ width: 400 }}>
              <Skeleton height={24} width="40%" />
              <Skeleton height={14} />
              <Skeleton height={14} />
              <Skeleton height={14} width="80%" />
            </Stack>
            <Stack gap={8} style={{ width: 400 }}>
              <Skeleton height={24} width="40%" />
              <Skeleton height={14} width="60%" />
            </Stack>
          </Flex>
          <Box mb={30}>
            <Skeleton height={24} width="30%" mb={12} />
            <SimpleGrid cols={2} spacing="xs">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={14} />
              ))}
            </SimpleGrid>
          </Box>
          <Skeleton height={280} radius="md" />
        </Box>
      </Flex>
    </>
  );
};
