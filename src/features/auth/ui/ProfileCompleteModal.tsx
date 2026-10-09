import { useState } from 'react';
import { Button, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { IconUserCheck } from '@tabler/icons-react';

import { UserService } from '@shared/api';
import { useAuth } from '../model/AuthContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

export const ProfileCompleteModal = () => {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    username: user?.login ?? '',
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    phone: user?.phoneNumber ?? '',
    birth_date: user?.birthDate ?? '',
    gender: user?.gender ?? '',
  });

  const mutation = useMutation({
    mutationFn: UserService.completeProfile,
    onSuccess: () => refreshUser(),
  });

  if (!user || user.profileComplete !== false) return null;

  const isValid =
    form.username.trim().length > 0 &&
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    mutation.mutate({
      username: form.username.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim() || undefined,
      birth_date: form.birth_date.trim() || undefined,
      gender: form.gender || undefined,
    });
  };

  return (
    <Modal
      opened
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="sm"
      centered
    >
      <Stack gap="md">
        <Group gap={10} align="center">
          <IconUserCheck size={28} color="#FF8104" />
          <Title order={3}>Заполните профиль</Title>
        </Group>
        <Text size="sm" c="dimmed">
          Для продолжения работы необходимо заполнить обязательные данные профиля.
        </Text>

        <TextInput
          label="Имя пользователя"
          required
          value={form.username}
          onChange={e => { const v = e.currentTarget.value; setForm(prev => ({ ...prev, username: v })); }}
          placeholder="alex_92"
        />
        <TextInput
          label="Имя"
          required
          value={form.first_name}
          onChange={e => { const v = e.currentTarget.value; setForm(prev => ({ ...prev, first_name: v })); }}
          placeholder="Введите имя"
        />
        <TextInput
          label="Фамилия"
          required
          value={form.last_name}
          onChange={e => { const v = e.currentTarget.value; setForm(prev => ({ ...prev, last_name: v })); }}
          placeholder="Введите фамилию"
        />
        <TextInput
          label="Телефон"
          value={form.phone}
          onChange={e => { const v = e.currentTarget.value; setForm(prev => ({ ...prev, phone: v })); }}
          placeholder="+79001234567"
        />
        <TextInput
          label="Дата рождения"
          value={form.birth_date}
          onChange={e => { const v = e.currentTarget.value; setForm(prev => ({ ...prev, birth_date: v })); }}
          placeholder="ГГГГ-ММ-ДД"
        />
        <Select
          label="Пол"
          value={form.gender || null}
          onChange={val => setForm(prev => ({ ...prev, gender: val ?? '' }))}
          data={GENDER_OPTIONS}
          placeholder="Выберите пол"
          clearable
        />

        {mutation.isError && (
          <Text size="sm" c="red">Ошибка сохранения. Попробуйте ещё раз.</Text>
        )}

        <Button
          fullWidth
          color="orange"
          radius="md"
          disabled={!isValid}
          loading={mutation.isPending}
          onClick={handleSave}
        >
          Сохранить и продолжить
        </Button>
      </Stack>
    </Modal>
  );
};
