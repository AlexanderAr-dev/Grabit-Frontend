import { Stack, Title, Checkbox, Button, Group } from "@mantine/core";
import { useState } from "react";
import { StepProps } from "../types/StepProps";

const days = [
  { key: "mon", label: "Понедельник" },
  { key: "tue", label: "Вторник" },
  { key: "wed", label: "Среда" },
  { key: "thu", label: "Четверг" },
  { key: "fri", label: "Пятница" },
  { key: "sat", label: "Суббота" },
  { key: "sun", label: "Воскресенье" },
];

const WeekDaysStep = ({ data, updateData, next, prev }: StepProps) => {
  const [selected, setSelected] = useState<string[]>(
    data.booking?.enabledDays ?? []
  );

  const toggleDay = (day: string) => {
    setSelected((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleNext = () => {
    updateData({
      booking: {
        ...data.booking,
        enabledDays: selected,
      },
    });

    next?.();
  };

  return (
    <Stack>

      <Title order={2}>Дни аренды</Title>

      <Stack>
        {days.map((d) => (
          <Checkbox
            key={d.key}
            label={d.label}
            checked={selected.includes(d.key)}
            onChange={() => toggleDay(d.key)}
          />
        ))}
      </Stack>

      <Group justify="space-between">
        <Button variant="default" onClick={prev}>
          Назад
        </Button>

        <Button disabled={!selected.length} onClick={handleNext}>
          Далее
        </Button>
      </Group>
    </Stack>
  );
};

export default WeekDaysStep;