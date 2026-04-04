import { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconPhoto, IconStar, IconTrash, IconUpload, IconVideo } from '@tabler/icons-react';

import { Button } from '@shared/ui';
import { MediaFile } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

// Включить/выключить обязательность медиа
const VALIDATION_ENABLED = false;

const MediaStep = ({ data, updateData, next, prev }: StepProps) => {
  const [files, setFiles] = useState<MediaFile[]>(data.media ?? []);
  const [previewIndex, setPreviewIndex] = useState<number>(data.previewIndex ?? 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  // Отзываем object URL-ы при анмаунте, чтобы не было утечки памяти
  useEffect(() => {
    return () => {
      filesRef.current.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const newFiles: MediaFile[] = selected.map(f => ({
      url: URL.createObjectURL(f),
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
    }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].url);
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    if (previewIndex >= next.length) {
      setPreviewIndex(Math.max(0, next.length - 1));
    } else if (previewIndex > index) {
      setPreviewIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (VALIDATION_ENABLED && files.length === 0) return;
    updateData({ media: files, previewIndex });
    next?.();
  };

  const canProceed = !VALIDATION_ENABLED || files.length > 0;

  return (
    <Stack gap="md">
      <Title order={2}>Фото и видео</Title>
      <Text c="dimmed" size="sm">
        Загрузите фотографии и видео объявления. Отметьте одно фото как превью — оно будет
        показываться в каталоге.
      </Text>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
      >
        <Flex align="center" gap={8}>
          <IconUpload size={16} />
          Загрузить файлы
        </Flex>
      </Button>

      {files.length === 0 && (
        <Box
          style={{
            border: '2px dashed #dee2e6',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => inputRef.current?.click()}
        >
          <IconPhoto size={36} color="#adb5bd" />
          <Text c="dimmed" size="sm" mt={8}>
            Нажмите чтобы выбрать или перетащите файлы
          </Text>
          <Text c="dimmed" size="xs" mt={4}>
            JPG, PNG, GIF, MP4, MOV
          </Text>
        </Box>
      )}

      {files.length > 0 && (
        <SimpleGrid cols={3} spacing="sm">
          {files.map((file, index) => (
            <Box
              key={file.url}
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                border: index === previewIndex ? '2px solid #FF8104' : '2px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewIndex(index)}
            >
              {file.type === 'image' ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  h={120}
                  fit="cover"
                />
              ) : (
                <Box
                  h={120}
                  style={{
                    background: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <IconVideo size={32} color="#adb5bd" />
                  <Text size="xs" c="dimmed" ta="center" px={4} style={{ wordBreak: 'break-word' }}>
                    {file.name}
                  </Text>
                </Box>
              )}

              {/* Превью бейдж */}
              {index === previewIndex && (
                <Badge
                  size="xs"
                  color="orange"
                  style={{ position: 'absolute', top: 6, left: 6 }}
                  leftSection={<IconStar size={10} />}
                >
                  Превью
                </Badge>
              )}

              {/* Удалить */}
              <ActionIcon
                size="sm"
                color="red"
                variant="filled"
                style={{ position: 'absolute', top: 6, right: 6 }}
                onClick={e => { e.stopPropagation(); removeFile(index); }}
              >
                <IconTrash size={12} />
              </ActionIcon>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {files.length > 0 && (
        <Text size="xs" c="dimmed">
          Нажмите на фото, чтобы выбрать его превью. Загружено: {files.length} файл(ов).
        </Text>
      )}

      <Group justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!canProceed} onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default MediaStep;
