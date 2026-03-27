import { Button, Stack, Title } from '@mantine/core';

import { StepProps } from '../model/types/StepProps';

const BookingCalendarStep = ({ prev }: StepProps) => {
  return (
    <Stack>
      <Title order={2}>Календарь бронирования</Title>
      <Button variant="default" onClick={prev}>Назад</Button>
    </Stack>
  );
};

export default BookingCalendarStep;
