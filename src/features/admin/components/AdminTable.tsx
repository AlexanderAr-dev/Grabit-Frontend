import { ReactNode } from 'react';
import { Center, Group, Loader, Pagination, Stack, Table, Text } from '@mantine/core';

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: number | string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  actions?: (row: T) => ReactNode;
  rowKey?: (row: T) => string | number;
}

export function AdminTable<T>({
  columns,
  data,
  total,
  page,
  pageSize = 15,
  isLoading,
  onPageChange,
  actions,
  rowKey,
}: AdminTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader color="orange" />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden' }}
      >
        <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
          <Table.Tr>
            {columns.map(col => (
              <Table.Th key={col.key} style={{ fontSize: 13, fontWeight: 600, width: col.width }}>
                {col.label}
              </Table.Th>
            ))}
            {actions && (
              <Table.Th style={{ width: 1, whiteSpace: 'nowrap' }}>Действия</Table.Th>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                <Center py="lg">
                  <Text c="dimmed" size="sm">
                    Нет данных
                  </Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((row, i) => (
              <Table.Tr key={rowKey ? rowKey(row) : i}>
                {columns.map(col => (
                  <Table.Td key={col.key} style={{ fontSize: 13 }}>
                    {col.render(row)}
                  </Table.Td>
                ))}
                {actions && (
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      {actions(row)}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
      {totalPages > 1 && (
        <Center>
          <Pagination value={page} onChange={onPageChange} total={totalPages} color="orange" size="sm" />
        </Center>
      )}
    </Stack>
  );
}
