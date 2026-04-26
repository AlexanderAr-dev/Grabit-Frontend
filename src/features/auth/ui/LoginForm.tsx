import { useNavigate } from 'react-router-dom';
import { Container, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

import { Button, Input, PageHeader } from '@shared/ui';
import { useAuth } from '../model/AuthContext';

export const LoginForm = () => {
  const { mockLogin } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Неверный формат email'),
      password: value => (value.length >= 1 ? null : 'Введите пароль'),
    },
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    mockLogin(values.email);
    navigate('/');
  };

  return (
    <Container
      size={500}
      mt={40}
      style={{
        border: '1px solid #7D7F88',
        borderRadius: '10px',
        padding: '0px 25px 20px 25px',
      }}
    >
      <PageHeader title="Вход" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Input
          mt="lg"
          label="Почта"
          placeholder="example@mail.ru"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        <Input
          type="password"
          mt="lg"
          label="Пароль"
          placeholder="Пароль"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />

        <Button type="submit" variant="primary" mt={40} w="100%">
          <Text size="lg">Войти</Text>
        </Button>
      </form>
    </Container>
  );
};
