import { Button, Container, Text } from '@mantine/core';

import { AuthService } from '@shared/api';

export const RegisterForm = () => {
  const handleRegister = () => {
    window.location.href = AuthService.getSsoLoginUrl();
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
      <Text
        c="white"
        style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}
      >
        <h1>Регистрация</h1>
      </Text>

      <Text size="sm" c="dimmed" mb="xl" style={{ textAlign: 'center' }}>
        Регистрация и вход выполняются через единый аккаунт (SSO).
      </Text>

      <Button color="orange" w="100%" onClick={handleRegister}>
        <Text size="lg">Зарегистрироваться / Войти</Text>
      </Button>
    </Container>
  );
};
