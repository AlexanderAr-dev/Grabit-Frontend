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
import { IconPhoto, IconTrash, IconUpload, IconVideo } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rentService } from '@shared/api';
import { IMediaType } from '@shared/types';
import { Button } from '@shared/ui';

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

export const EditMediaSection = ({ listingId, media }: EditMediaSectionProps) => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<LocalPreview[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const isUploading = uploading.length > 0;

  const { mutate: deleteItem } = useMutation({
    mutationFn: (mediaId: string) => rentService.deleteMedia(listingId, mediaId),
    onMutate: (mediaId) => setDeletingIds(prev => new Set(prev).add(mediaId)),
    onSettled: (_, __, mediaId) => {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(mediaId); return s; });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rentAd', listingId] }),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const arr = Array.from(files);
    const previews: LocalPreview[] = arr.map(f => ({
      objectUrl: URL.createObjectURL(f),
      name: f.name,
      isVideo: f.type.startsWith('video'),
    }));

    setUploading(prev => [...prev, ...previews]);

    await Promise.allSettled(arr.map(f => rentService.uploadMedia(listingId, f)));

    previews.forEach(p => URL.revokeObjectURL(p.objectUrl));

    // Refetch first, then remove skeletons to avoid a flash of empty state
    await queryClient.refetchQueries({ queryKey: ['rentAd', listingId] });
    setUploading(prev => prev.filter(p => !previews.includes(p)));

    if (inputRef.current) inputRef.current.value = '';
  };

  const isEmpty = media.length === 0 && uploading.length === 0;

  return (
    <Box>
      <Title order={3} mb={12}>Фото и видео</Title>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        style={{ marginBottom: 12 }}
      >
        <Flex align="center" gap={8}>
          <IconUpload size={16} />
          {isUploading ? `Загружается ${uploading.length} файл(ов)...` : 'Загрузить файлы'}
        </Flex>
      </Button>

      {isEmpty && (
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
          <Text c="dimmed" size="sm" mt={8}>Нажмите чтобы выбрать или перетащите файлы</Text>
          <Text c="dimmed" size="xs" mt={4}>JPG, PNG, GIF, MP4, MOV</Text>
        </Box>
      )}

      {!isEmpty && (
        <SimpleGrid cols={3} spacing="sm">
          {media.map(item => {
            const idStr = String(item.id);
            const isDeleting = deletingIds.has(idStr);
            return isDeleting ? (
              <Skeleton key={item.id} height={120} radius="md" animate />
            ) : (
              <Box
                key={item.id}
                style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid transparent' }}
              >
                <MediaThumb src={item.url} isVideo={isVideoItem(item)} />
                <ActionIcon
                  size="sm"
                  color="red"
                  variant="filled"
                  disabled={isUploading}
                  style={{ position: 'absolute', top: 6, right: 6 }}
                  onClick={() => deleteItem(idStr)}
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Box>
            );
          })}

          {uploading.map((_, i) => (
            <Skeleton
              key={`uploading-${i}`}
              height={120}
              radius="md"
              animate
            />
          ))}
        </SimpleGrid>
      )}

      {media.length > 0 && (
        <Text size="xs" c="dimmed" mt={8}>Загружено: {media.length} файл(ов)</Text>
      )}
    </Box>
  );
};
