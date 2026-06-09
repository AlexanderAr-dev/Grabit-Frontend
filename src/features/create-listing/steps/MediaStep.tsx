import { useRef, useState } from 'react';
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
import { notifications } from '@mantine/notifications';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconPhoto, IconStar, IconTrash, IconUpload, IconVideo } from '@tabler/icons-react';

import { Button } from '@shared/ui';
import { MediaFile } from '../model/types/CreateListing';
import { StepProps } from '../model/types/StepProps';

const VALIDATION_ENABLED = false;
const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

interface SortablePhotoProps {
  file: MediaFile;
  index: number;
  isPreview: boolean;
  onRemove: () => void;
  onClick: () => void;
}

const SortablePhoto = ({ file, index, isPreview, onRemove, onClick }: SortablePhotoProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.url });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        border: isPreview ? '2px solid #FF8104' : '2px solid transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
      onClick={onClick}
    >
      <Image src={file.url} alt={file.name} h={120} fit="cover" style={{ pointerEvents: 'none' }} />

      {isPreview && (
        <Badge size="xs" color="orange" style={{ position: 'absolute', top: 6, left: 6, pointerEvents: 'none' }} leftSection={<IconStar size={10} />}>
          Превью
        </Badge>
      )}

      <ActionIcon
        size="sm"
        color="red"
        variant="filled"
        style={{ position: 'absolute', top: 6, right: 6 }}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onRemove(); }}
      >
        <IconTrash size={12} />
      </ActionIcon>

      <Badge size="xs" color="gray" style={{ position: 'absolute', bottom: 6, left: 6, pointerEvents: 'none' }}>
        {index + 1}
      </Badge>
    </Box>
  );
};

const MediaStep = ({ data, updateData, next, prev }: StepProps) => {
  const [photos, setPhotos] = useState<MediaFile[]>(
    (data.media ?? []).filter(m => m.type !== 'video'),
  );
  const [video, setVideo] = useState<MediaFile | null>(
    (data.media ?? []).find(m => m.type === 'video') ?? null,
  );
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid: MediaFile[] = [];

    for (const f of selected) {
      if (f.size > MAX_PHOTO_SIZE) {
        notifications.show({ color: 'red', title: 'Файл слишком большой', message: `${f.name} превышает 20 МБ` });
        continue;
      }
      valid.push({ url: URL.createObjectURL(f), name: f.name, type: 'image', file: f });
    }

    setPhotos(prev => [...prev, ...valid]);
    e.target.value = '';
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > MAX_VIDEO_SIZE) {
      notifications.show({ color: 'red', title: 'Файл слишком большой', message: `Видео не должно превышать 500 МБ` });
      e.target.value = '';
      return;
    }

    if (video) URL.revokeObjectURL(video.url);
    setVideo({ url: URL.createObjectURL(f), name: f.name, type: 'video', file: f });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].url);
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    if (previewIndex >= next.length) setPreviewIndex(Math.max(0, next.length - 1));
    else if (previewIndex > index) setPreviewIndex(p => p - 1);
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPhotos(prev => {
      const oldIndex = prev.findIndex(f => f.url === active.id);
      const newIndex = prev.findIndex(f => f.url === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    // Первое фото всегда превью — индекс 0
    setPreviewIndex(0);
  };

  const handleNext = () => {
    if (VALIDATION_ENABLED && photos.length === 0) return;
    const media: MediaFile[] = [...photos, ...(video ? [video] : [])];
    updateData({ media, previewIndex });
    next?.();
  };

  const canProceed = !VALIDATION_ENABLED || photos.length > 0;

  return (
    <Stack gap="md">
      <Title order={2}>Фото и видео</Title>
      <Text c="dimmed" size="sm">
        Загрузите фотографии и видео объявления. Перетащите фото, чтобы изменить порядок. Первое фото — превью в каталоге.
      </Text>

      {/* Фото */}
      <Box>
        <Text fw={500} mb={8}>Фотографии (JPEG, PNG, WebP, макс 20 МБ)</Text>

        <input
          ref={photoInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        <Button variant="secondary" onClick={() => photoInputRef.current?.click()}>
          <Flex align="center" gap={8}>
            <IconUpload size={16} />
            Добавить фото
          </Flex>
        </Button>

        {photos.length === 0 && (
          <Box
            mt={8}
            style={{
              border: '2px dashed #dee2e6',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => photoInputRef.current?.click()}
          >
            <IconPhoto size={32} color="#adb5bd" />
            <Text c="dimmed" size="sm" mt={8}>Нажмите или перетащите фотографии</Text>
          </Box>
        )}

        {photos.length > 0 && (
          <Box mt={8}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={photos.map(f => f.url)} strategy={rectSortingStrategy}>
                <SimpleGrid cols={3} spacing="sm">
                  {photos.map((file, index) => (
                    <SortablePhoto
                      key={file.url}
                      file={file}
                      index={index}
                      isPreview={index === previewIndex}
                      onRemove={() => removePhoto(index)}
                      onClick={() => setPreviewIndex(index)}
                    />
                  ))}
                </SimpleGrid>
              </SortableContext>
            </DndContext>
            <Text size="xs" c="dimmed" mt={6}>
              Перетащите фото для изменения порядка. Первое фото — превью. Загружено: {photos.length}
            </Text>
          </Box>
        )}
      </Box>

      {/* Видео */}
      <Box>
        <Text fw={500} mb={8}>Видео (MP4, макс 500 МБ, один файл)</Text>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4"
          style={{ display: 'none' }}
          onChange={handleVideoChange}
        />

        {!video && (
          <Button variant="secondary" onClick={() => videoInputRef.current?.click()}>
            <Flex align="center" gap={8}>
              <IconUpload size={16} />
              Добавить видео
            </Flex>
          </Button>
        )}

        {video && (
          <Box
            style={{
              position: 'relative',
              width: 180,
              borderRadius: 8,
              overflow: 'hidden',
              border: '2px solid #dee2e6',
            }}
          >
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
                {video.name}
              </Text>
            </Box>
            <ActionIcon
              size="sm"
              color="red"
              variant="filled"
              style={{ position: 'absolute', top: 6, right: 6 }}
              onClick={removeVideo}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Box>
        )}
      </Box>

      <Group justify="space-between" mt="md">
        <Button variant="secondary" onClick={prev}>Назад</Button>
        <Button disabled={!canProceed} onClick={handleNext}>Далее</Button>
      </Group>
    </Stack>
  );
};

export default MediaStep;
