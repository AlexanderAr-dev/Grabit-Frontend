import { ReactNode, useState } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

interface ConfirmActionProps {
  trigger: (open: () => void) => ReactNode;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmAction({
  trigger,
  title,
  message,
  confirmLabel = 'Подтвердить',
  confirmColor = 'red',
  onConfirm,
}: ConfirmActionProps) {
  const [opened, setOpened] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpened(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {trigger(() => setOpened(true))}
      <Modal opened={opened} onClose={() => setOpened(false)} title={title} centered size="sm">
        <Text size="sm" mb="lg">
          {message}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)} disabled={pending}>
            Отмена
          </Button>
          <Button color={confirmColor} onClick={handleConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
