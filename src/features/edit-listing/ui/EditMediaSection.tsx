import { useRef, useState } from 'react';
import {
  ActionIcon,
  Box,
  Center,
  Flex,
  SimpleGrid,
  Skeleton,
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
import { IconPhoto, IconTrash, IconUpload, IconVideo } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { IMediaType } from '@shared/types';
import { Button } from '@shared/ui';

const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

interface EditMediaSectionProps {
  listingId: string;
  media: IMediaType[];
}

interface LocalPreview {
  objectUrl: string;
  name: string;
  isVideo: boolean;
}

const isVideoItem = (item: IMediaType) =>
  item.mediaType?.startsWith('video') || /\.(mp4|webm|mov)(\?|$)/i.test(item.url);

function MediaThumb({ src, isVideo: video }: { src: string; isVideo?: boolean }) {
  const [broken, setBroken] = useState(false);

  if (video) {
    return (
      <Center h={120} style={{ background: '#1a1a2e', flexDirection: 'column', gap: 8 }}>
        <IconVideo size={32} color="#adb5bd" />
        <Text size="xs" c="dimmed">видео</Text>
      </Center>
    );
  }

  if (broken) {
    return (
      <Center h={120} style={{ background: '#f1f3f5', flexDirection: 'column', gap: 6 }}>
        <IconPhoto size={28} color="#adb5bd" />
        <Text size="xs" c="dimmed" ta="center">предпросмотр недоступен</Text>
      </Center>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
    />
  );
}

interface SortableMediaItemProps {
  item: IMediaType;
  isDeleting: boolean;
  isUploading: boolean;
  onDelete: () => void;
}

const SortableMediaItem = ({ item, isDeleting, isUploading, onDelete }: SortableMediaItemProps) => {
  const idStr = String(item.id);
  const isVideo = isVideoItem(item);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idStr,
    disabled: isVideo,
  });

  if (isDeleting) return <Skeleton height={120} radius="md" animate />;

  return (
    <Box
      ref={setNodeRef}
      {...(isVideo ? {} : { ...attributes, ...listeners })}
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        border: '2px solid transparent',
        cursor: isVideo ? 'default' : isDragging ? 'grabbing' : 'grab',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
      }}
    >
      <MediaThumb src={item.url} isVideo={isVideo} />
      <ActionIcon
        size="sm"
        color="red"
        variant="filled"
        disabled={isUploading}
        style={{ position: 'absolute', top: 6, right: 6 }}
        onPointerDown={e => e.stopPropagation()}
        onClick={onDelete}
      >
        <IconTrash size={12} />
      </ActionIcon>
    </Box>
  );
};

export const EditMediaSection = ({ listingId, media }: EditMediaSectionProps) => {
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<LocalPreview[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [optimisticPhotos, setOptimisticPhotos] = useState<IMediaType[] | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const serverPhotos = media.filter(m => !isVideoItem(m));
  const photos = optimisticPhotos ?? serverPhotos;
  const videos = media.filter(m => isVideoItem(m));
  const isUploading = uploading.length > 0;

  const { mutate: deleteItem } = useMutation({
    mutationFn: (mediaId: string) => rentService.deleteMedia(listingId, mediaId),
    onMutate: (mediaId) => setDeletingIds(prev => new Set(prev).add(mediaId)),
    onSettled: (_, __, mediaId) => {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(mediaId); return s; });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rentAd', listingId] }),
  });

  const handlePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (f.size > MAX_PHOTO_SIZE) {
        notifications.show({ color: 'red', title: 'Файл слишком большой', message: `${f.name} превышает 20 МБ` });
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    const previews: LocalPreview[] = valid.map(f => ({ objectUrl: URL.createObjectURL(f), name: f.name, isVideo: false }));
    setUploading(prev => [...prev, ...previews]);

    const currentPhotoCount = photos.length;
    await Promise.allSettled(
      valid.map((f, i) =>
        rentService.uploadPhoto({ listingId, file: f, sort_order: currentPhotoCount + i + 1 })
      )
    );

    previews.forEach(p => URL.revokeObjectURL(p.objectUrl));
    await queryClient.refetchQueries({ queryKey: ['rentAd', listingId] });
    setUploading(prev => prev.filter(p => !previews.includes(p)));
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleVideo = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;

    if (f.size > MAX_VIDEO_SIZE) {
      notifications.show({ color: 'red', title: 'Файл слишком большой', message: 'Видео не должно превышать 500 МБ' });
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    const preview: LocalPreview = { objectUrl: URL.createObjectURL(f), name: f.name, isVideo: true };
    setUploading(prev => [...prev, preview]);

    await rentService.uploadVideo({ listingId, file: f, sort_order: videos.length + 1 });

    URL.revokeObjectURL(preview.objectUrl);
    await queryClient.refetchQueries({ queryKey: ['rentAd', listingId] });
    setUploading(prev => prev.filter(p => p !== preview));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePhotoDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex(p => String(p.id) === active.id);
    const newIndex = photos.findIndex(p => String(p.id) === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);

    // Оптимистично обновляем порядок сразу
    setOptimisticPhotos(reordered);

    const items = reordered.map((p, i) => ({
      media_id: p.media_id ?? String(p.id),
      sort_order: i + 1,
    }));

    try {
      await rentService.reorderPhotos({ listingId, items });
      await queryClient.refetchQueries({ queryKey: ['rentAd', listingId] });
      setOptimisticPhotos(null);
    } catch {
      setOptimisticPhotos(null);
      notifications.show({ color: 'red', title: 'Ошибка', message: 'Не удалось изменить порядок фотографий' });
    }
  };

  const isEmpty = media.length === 0 && uploading.length === 0;

  return (
    <Box>
      <Title order={3} mb={12}>Фото и видео</Title>

      <input ref={photoInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handlePhotos(e.target.files)} />
      <input ref={videoInputRef} type="file" accept="video/mp4" style={{ display: 'none' }} onChange={e => handleVideo(e.target.files)} />

      <Flex gap={8} mb={12}>
        <Button variant="secondary" onClick={() => photoInputRef.current?.click()} disabled={isUploading}>
          <Flex align="center" gap={8}>
            <IconUpload size={16} />
            {isUploading ? 'Загрузка...' : 'Добавить фото'}
          </Flex>
        </Button>
        <Button variant="secondary" onClick={() => videoInputRef.current?.click()} disabled={isUploading || videos.length > 0}>
          <Flex align="center" gap={8}>
            <IconUpload size={16} />
            Добавить видео
          </Flex>
        </Button>
      </Flex>

      {isEmpty && (
        <Box
          style={{ border: '2px dashed #dee2e6', borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => photoInputRef.current?.click()}
        >
          <IconPhoto size={36} color="#adb5bd" />
          <Text c="dimmed" size="sm" mt={8}>Нажмите чтобы выбрать фотографии</Text>
          <Text c="dimmed" size="xs" mt={4}>JPEG, PNG, WebP — до 20 МБ</Text>
        </Box>
      )}

      {!isEmpty && (
        <Box>
          {/* Фото с drag & drop */}
          {(photos.length > 0 || uploading.some(u => !u.isVideo)) && (
            <Box mb={16}>
              <Text size="sm" fw={500} mb={8}>Фотографии</Text>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhotoDragEnd}>
                <SortableContext items={photos.map(p => String(p.id))} strategy={rectSortingStrategy}>
                  <SimpleGrid cols={3} spacing="sm">
                    {photos.map(item => (
                      <SortableMediaItem
                        key={item.id}
                        item={item}
                        isDeleting={deletingIds.has(String(item.id))}
                        isUploading={isUploading}
                        onDelete={() => deleteItem(String(item.id))}
                      />
                    ))}
                    {uploading.filter(u => !u.isVideo).map((_, i) => (
                      <Skeleton key={`uploading-photo-${i}`} height={120} radius="md" animate />
                    ))}
                  </SimpleGrid>
                </SortableContext>
              </DndContext>
              {photos.length > 1 && (
                <Text size="xs" c="dimmed" mt={6}>Перетащите фото для изменения порядка</Text>
              )}
            </Box>
          )}

          {/* Видео */}
          {(videos.length > 0 || uploading.some(u => u.isVideo)) && (
            <Box>
              <Text size="sm" fw={500} mb={8}>Видео</Text>
              <SimpleGrid cols={3} spacing="sm">
                {videos.map(item => (
                  <Box
                    key={item.id}
                    style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid transparent' }}
                  >
                    <MediaThumb src={item.url} isVideo />
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="filled"
                      disabled={isUploading}
                      style={{ position: 'absolute', top: 6, right: 6 }}
                      onClick={() => deleteItem(String(item.id))}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Box>
                ))}
                {uploading.filter(u => u.isVideo).map((_, i) => (
                  <Skeleton key={`uploading-video-${i}`} height={120} radius="md" animate />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Box>
      )}

      {media.length > 0 && (
        <Text size="xs" c="dimmed" mt={8}>Загружено: {media.length} файл(ов)</Text>
      )}
    </Box>
  );
};
