import { useState } from 'react';
import { Badge, Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AdminCategory, AdminService } from '../api/adminService';
import { AdminTable } from '../components/AdminTable';

interface CategoryFormValues {
  name_ru: string;
  name_en: string;
  parent_id: string;
  sort_order: number | string;
}

export function CategoriesPage() {
  const qc = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [migratingCategory, setMigratingCategory] = useState<AdminCategory | null>(null);
  const [migrateTo, setMigrateTo] = useState<string | null>(null);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [migrateOpened, { open: openMigrate, close: closeMigrate }] = useDisclosure(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: AdminService.getCategories,
  });

  const createForm = useForm<CategoryFormValues>({
    initialValues: { name_ru: '', name_en: '', parent_id: '', sort_order: '' },
    validate: {
      name_ru: v => (!v.trim() ? 'Обязательное поле' : null),
      name_en: v => (!v.trim() ? 'Обязательное поле' : null),
    },
  });

  const editForm = useForm<Pick<CategoryFormValues, 'name_ru' | 'name_en'>>({
    initialValues: { name_ru: '', name_en: '' },
    validate: {
      name_ru: v => (!v.trim() ? 'Обязательное поле' : null),
      name_en: v => (!v.trim() ? 'Обязательное поле' : null),
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      AdminService.createCategory({
        name_ru: values.name_ru,
        name_en: values.name_en,
        ...(values.parent_id ? { parent_id: Number(values.parent_id) } : {}),
        ...(values.sort_order !== '' ? { sort_order: Number(values.sort_order) } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifications.show({ message: 'Категория создана', color: 'green' });
      closeCreate();
      createForm.reset();
    },
    onError: () => notifications.show({ message: 'Ошибка создания', color: 'red' }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Pick<CategoryFormValues, 'name_ru' | 'name_en'> }) =>
      AdminService.updateCategory(id, { name_ru: values.name_ru, name_en: values.name_en }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifications.show({ message: 'Категория обновлена', color: 'green' });
      closeEdit();
    },
    onError: () => notifications.show({ message: 'Ошибка обновления', color: 'red' }),
  });

  const migrateMutation = useMutation({
    mutationFn: ({ id, to_id }: { id: number; to_id: number }) =>
      AdminService.migrateCategory(id, to_id),
    onSuccess: result => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifications.show({
        message: `Перенесено объявлений: ${result.migrated_count}`,
        color: 'green',
      });
      closeMigrate();
      setMigrateTo(null);
    },
    onError: () => notifications.show({ message: 'Ошибка переноса', color: 'red' }),
  });

  const parentOptions = categories.map(c => ({
    value: String(c.id),
    label: `${c.name_ru} (ID: ${c.id})`,
  }));

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: AdminCategory) => (
        <Text size="sm" ff="monospace">
          {row.id}
        </Text>
      ),
      width: 60,
    },
    {
      key: 'name',
      label: 'Название',
      render: (row: AdminCategory) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {row.name_ru}
          </Text>
          <Text size="xs" c="dimmed">
            {row.name_en}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'parent',
      label: 'Родитель',
      render: (row: AdminCategory) => {
        if (!row.parent_id) return <Text size="sm" c="dimmed">—</Text>;
        const parent = categories.find(c => c.id === row.parent_id);
        return <Text size="sm">{parent?.name_ru ?? `ID ${row.parent_id}`}</Text>;
      },
    },
    {
      key: 'count',
      label: 'Объявлений',
      render: (row: AdminCategory) => <Badge color="blue">{row.listing_count}</Badge>,
      width: 110,
    },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Категории</Title>
        <Button size="sm" color="orange" onClick={openCreate}>
          + Добавить
        </Button>
      </Group>

      <AdminTable
        columns={columns}
        data={categories}
        total={categories.length}
        page={1}
        pageSize={categories.length + 1}
        isLoading={isLoading}
        onPageChange={() => {}}
        actions={cat => (
          <Group gap={4} wrap="nowrap">
            <Button
              size="xs"
              variant="light"
              onClick={() => {
                setEditingCategory(cat);
                editForm.setValues({ name_ru: cat.name_ru, name_en: cat.name_en });
                openEdit();
              }}
            >
              Изменить
            </Button>
            <Button
              size="xs"
              variant="light"
              color="orange"
              onClick={() => {
                setMigratingCategory(cat);
                setMigrateTo(null);
                openMigrate();
              }}
            >
              Перенос
            </Button>
          </Group>
        )}
      />

      {/* Create */}
      <Modal opened={createOpened} onClose={closeCreate} title="Создать категорию" centered>
        <form onSubmit={createForm.onSubmit(values => createMutation.mutate(values))}>
          <Stack>
            <TextInput label="Название (RU)" required {...createForm.getInputProps('name_ru')} />
            <TextInput label="Название (EN)" required {...createForm.getInputProps('name_en')} />
            <Select
              label="Родительская категория"
              data={parentOptions}
              clearable
              placeholder="Без родителя"
              {...createForm.getInputProps('parent_id')}
            />
            <NumberInput
              label="Порядок сортировки"
              min={0}
              placeholder="0"
              {...createForm.getInputProps('sort_order')}
            />
            <Button type="submit" color="orange" loading={createMutation.isPending}>
              Создать
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Edit */}
      <Modal opened={editOpened} onClose={closeEdit} title="Переименовать категорию" centered>
        <form
          onSubmit={editForm.onSubmit(values =>
            editingCategory && editMutation.mutate({ id: editingCategory.id, values }),
          )}
        >
          <Stack>
            <TextInput label="Название (RU)" required {...editForm.getInputProps('name_ru')} />
            <TextInput label="Название (EN)" required {...editForm.getInputProps('name_en')} />
            <Text size="xs" c="dimmed">
              Slug не меняется при переименовании
            </Text>
            <Button type="submit" color="orange" loading={editMutation.isPending}>
              Сохранить
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Migrate */}
      <Modal
        opened={migrateOpened}
        onClose={closeMigrate}
        title="Перенос объявлений"
        centered
        size="sm"
      >
        <Stack>
          <Text size="sm">
            Все объявления из категории{' '}
            <b>{migratingCategory?.name_ru}</b> будут перенесены в выбранную, после чего
            исходная категория будет физически удалена.
          </Text>
          <Select
            label="Перенести в"
            placeholder="Выберите категорию"
            value={migrateTo}
            onChange={setMigrateTo}
            data={categories
              .filter(c => c.id !== migratingCategory?.id)
              .map(c => ({ value: String(c.id), label: c.name_ru }))}
          />
          <Button
            color="orange"
            disabled={!migrateTo}
            loading={migrateMutation.isPending}
            onClick={() =>
              migratingCategory &&
              migrateTo &&
              migrateMutation.mutate({
                id: migratingCategory.id,
                to_id: Number(migrateTo),
              })
            }
          >
            Перенести и удалить категорию
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
