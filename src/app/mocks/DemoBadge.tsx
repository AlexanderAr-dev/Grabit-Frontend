import { Badge, Box } from '@mantine/core';

/** Плашка «демо-версия» — чтобы было видно, что данные тестовые */
export const DemoBadge = () => (
  <>
    {/* На мобильных поднимаем над нижней навигацией */}
    <Box
      hiddenFrom="sm"
      pos="fixed"
      left={12}
      bottom="calc(72px + env(safe-area-inset-bottom, 0px))"
      style={{ zIndex: 300, pointerEvents: 'none' }}
    >
      <Badge color="orange" variant="filled" size="sm">
        Демо · тестовые данные
      </Badge>
    </Box>
    <Box
      visibleFrom="sm"
      pos="fixed"
      right={16}
      bottom={16}
      style={{ zIndex: 300, pointerEvents: 'none' }}
    >
      <Badge color="orange" variant="filled" size="md">
        Демо-версия · тестовые данные
      </Badge>
    </Box>
  </>
);
