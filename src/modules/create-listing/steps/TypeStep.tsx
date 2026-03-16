import { Stack, Title, Button, Group } from "@mantine/core";
import { StepProps } from '@modules/create-listing/types/StepProps.ts';

const TypeStep = ({ updateData, next }: StepProps) => {
  const selectItems = () => {
    updateData({ type: "item_rent" });
    next?.();
  };

  return (
    <Stack>
      <Title order={2}>Тип объявления</Title>

      <Group>
        <Button onClick={selectItems}>
          Аренда предметов
        </Button>

        <Button disabled>
          Аренда услуг
        </Button>

        <Button disabled>
          Аренда помещений
        </Button>
      </Group>
    </Stack>
  );
};

export default TypeStep;