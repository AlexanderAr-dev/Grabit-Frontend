import {
  Card,
  Group,
  Image,
  Rating,
  Text,
} from '@mantine/core';

export const SmallCard = ({
  image,
  title,
  price,
  district,
  date,
  rating,
}) => {
  return (
    <Card
      shadow="md"
      radius="lg"
      withBorder={false}
      style={{
        backgroundColor: '#0E1621',
        color: 'white',
        overflow: 'hidden',
        border: '1px solid #1E293B',
      }}
    >
      <Card.Section>
        <Image src={image} height={200} alt={title} />
      </Card.Section>

      <div style={{ padding: '14px 16px' }}>
        <Group
          justify="space-between"
          align="center"
          mb="xs"
        >
          <Rating value={rating} readOnly color="yellow" />
          <Text size="sm" c="gray.4">
            {date}
          </Text>
        </Group>

        <Text size="xl" fw={600} mb={4}>
          {title}
        </Text>
        <Text fw={700} size="lg" mb={2}>
          {price}
        </Text>
        <Text size="sm" c="gray.4">
          {district}
        </Text>
      </div>
    </Card>
  );
};
