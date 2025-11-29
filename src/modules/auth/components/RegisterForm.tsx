import {
  Button,
  Container,
  NativeSelect,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useProfileRegister } from '@modules/auth/hooks/useRegister.ts';

export const RegisterForm = () => {
  const profileRegister = useProfileRegister();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '', login: '' },

    validate: {
      password: value =>
        value.length < 8
          ? 'Пароль должен быть длинее 8 символов'
          : null,
      email: value =>
        /^\S+@\S+$/.test(value)
          ? null
          : 'Неправильная почта',
      login: value =>
        value.length < 8
          ? 'Логин должен быть длинее 8 символов'
          : null,
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
        <h1>Регистрация</h1>
      </Text>
      <form
        onSubmit={form.onSubmit(values => {
          profileRegister.mutate(values);
        })}
      >
        <TextInput
          c={'white'}
          mt="lg"
          label={<Text size="lg">Почта</Text>}
          placeholder="Login"
          key={form.key('login')}
          {...form.getInputProps('login')}
        />
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
        <PasswordInput
          c={'white'}
          mt="lg"
          label={<Text size="lg">Подтвердите пароль</Text>}
        />
        <NativeSelect
          label="Выбор языка"
          data={['Русский', 'Английский']}
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
