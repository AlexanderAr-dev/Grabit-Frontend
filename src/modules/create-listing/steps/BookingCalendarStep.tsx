import { Button, Stack, Title } from "@mantine/core";
import { StepProps } from '@modules/create-listing/types/StepProps.ts';

const BookingCalendarStep = ({ data, updateData, prev }: StepProps) => {
  return (
    <Stack>
      <Title order={2}>Календарь бронирования</Title>

      {/* тут будет календарь */}

      <Button variant="default" onClick={prev}>
        Назад
      </Button>
    </Stack>
  );
};

export default BookingCalendarStep;