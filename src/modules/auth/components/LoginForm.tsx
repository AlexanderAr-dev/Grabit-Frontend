import { Container, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useProfileLogin } from '@modules/auth/hooks/useLogin.ts';
import { Button, PageHeader } from '@ui';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label.tsx';

export const LoginForm = () => {
  const profileLogin = useProfileLogin();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      password: value =>
        value.length < 8
          ? 'Пароль должен содержать минимум 8 символов'
          : null,
      email: value =>
        /^\S+@\S+$/.test(value)
          ? null
          : 'Неверный формат email',
    },
  });

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
      <PageHeader title={'Вход'} />

      <form
        onSubmit={form.onSubmit(values => {
          profileLogin.mutate(values);
        })}
      >
        <Input
          mt="lg"
          label={'Почта'}
          placeholder="Email"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        <Input
          type="password"
          mt="lg"
          label={'Пароль'}
          placeholder="Пароль"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />

        <Button
          type="submit"
          variant="primary"
          mt={40}
          w="100%"
        >
          <Text size="lg">Войти</Text>
        </Button>
      </form>

      <Label title={'Еще нет аккаунта?'} mt={70} />

      <Button variant="secondary" w="100%" mt="md">
        <Text size="lg">Создать аккаунт</Text>
      </Button>
    </Container>
  );
};
