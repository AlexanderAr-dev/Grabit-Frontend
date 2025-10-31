import {
  Button,
  Container,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export const LoginForm = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },

    validate: {
      password: value =>
        value.length < 8
          ? 'Login must have at least 8 letters'
          : null,
      email: value =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email',
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
      <Text
        c={'white'}
        style={{
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <h1>Вход</h1>
      </Text>
      <form onSubmit={form.onSubmit(console.log)}>
        <TextInput
          c={'white'}
          mt="lg"
          label={<Text size="lg">Почта</Text>}
          placeholder="Email"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          c={'white'}
          mt="lg"
          label={<Text size="lg">Пароль</Text>}
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <Button
          type="submit"
          mt={40}
          bg={'#EA9432'}
          w="100%"
        >
          <Text size="lg">Войти</Text>
        </Button>
      </form>
      <Text
        size={'xl'}
        c={'white'}
        style={{
          textAlign: 'center',
          marginTop: '70px',
        }}
      >
        Еще нет аккаунта?
      </Text>
      <Button bg={'#667291'} w="100%">
        <Text size="lg">Создать аккаунт</Text>
      </Button>
    </Container>
  );
};
