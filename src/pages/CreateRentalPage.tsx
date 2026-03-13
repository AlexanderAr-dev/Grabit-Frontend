import { FC, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FileInput,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

export const CreateRentalPage: FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    alert('Предложение успешно создано!');
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">
        Создание предложения аренды
      </Title>

      <Paper shadow="sm" radius="lg" p="xl" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="xl">
            {/* Основная информация */}
            <Box>
              <Title order={4} mb="md">
                Основная информация
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Название объекта"
                    placeholder="Например: 2-комнатная квартира в центре"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Тип недвижимости"
                    placeholder="Выберите тип"
                    data={[
                      {
                        value: 'apartment',
                        label: 'Квартира',
                      },
                      { value: 'house', label: 'Дом' },
                      { value: 'studio', label: 'Студия' },
                      { value: 'room', label: 'Комната' },
                      {
                        value: 'commercial',
                        label: 'Коммерческая',
                      },
                    ]}
                    required
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Textarea
                    label="Описание"
                    placeholder="Подробное описание объекта, условий аренды и преимуществ"
                    minRows={4}
                    required
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Локация */}
            <Box>
              <Title order={4} mb="md">
                Локация
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Город"
                    placeholder="Москва"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Адрес"
                    placeholder="Улица, дом"
                    required
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Параметры аренды */}
            <Box>
              <Title order={4} mb="md">
                Параметры аренды
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label="Цена в месяц"
                    placeholder="50000"
                    min={0}
                    thousandSeparator=" "
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label="Залог"
                    placeholder="50000"
                    min={0}
                    thousandSeparator=" "
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label="Площадь (м²)"
                    placeholder="45"
                    min={0}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  {/*<DatePicker*/}
                  {/*  label="Дата доступности"*/}
                  {/*  placeholder="Выберите дату"*/}
                  {/*/>*/}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <MultiSelect
                    label="Удобства"
                    placeholder="Выберите удобства"
                    data={[
                      { value: 'wifi', label: 'Wi‑Fi' },
                      {
                        value: 'parking',
                        label: 'Парковка',
                      },
                      { value: 'elevator', label: 'Лифт' },
                      {
                        value: 'furniture',
                        label: 'Мебель',
                      },
                      {
                        value: 'appliances',
                        label: 'Бытовая техника',
                      },
                      { value: 'balcony', label: 'Балкон' },
                    ]}
                  />
                </Grid.Col>
              </Grid>

              <Stack mt="md">
                <Switch color={'#FF8104'} label="Можно с животными" />
                <Switch color={'#FF8104'} label="Можно с детьми" />
                <Switch color={'#FF8104'} label="Разрешено курение" />
              </Stack>
            </Box>

            <Divider />

            {/* Фотографии */}
            <Box>
              <Title order={4} mb="md">
                Фотографии
              </Title>
              <FileInput
                label="Загрузить фотографии"
                placeholder="Выберите файлы"
                leftSection={<IconUpload size={16} />}
                multiple
                accept="image/*"
              />
              <Text size="sm" c="dimmed" mt="xs">
                Рекомендуется загрузить минимум 3 фотографии
                высокого качества.
              </Text>
            </Box>

            <Group justify="flex-end" mt="md">
              <Button variant="default" type="button">
                Отмена
              </Button>
              <Button type="submit" loading={loading} bg={'#FF8104'}>
                Опубликовать
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
