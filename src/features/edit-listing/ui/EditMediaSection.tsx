import { useRef, useState } from 'react';
import {
  ActionIcon,
  Box,
  Center,
  Flex,
  Loader,
  SimpleGrid,
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['rentAd', listingId] });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (mediaId: string) => rentService.deleteMedia(listingId, mediaId),
    onSuccess: refresh,
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
    setUploading(prev => prev.filter(p => !previews.includes(p)));
    refresh();

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
        style={{ marginBottom: 12 }}
      >
        <Flex align="center" gap={8}>
          <IconUpload size={16} />
          Загрузить файлы
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
          {media.map(item => (
            <Box
              key={item.id}
              style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid transparent' }}
            >
              <MediaThumb src={item.url} isVideo={isVideoItem(item)} />
              <ActionIcon
                size="sm"
                color="red"
                variant="filled"
                style={{ position: 'absolute', top: 6, right: 6 }}
                onClick={() => deleteItem(String(item.id))}
              >
                <IconTrash size={12} />
              </ActionIcon>
            </Box>
          ))}

          {uploading.map((p, i) => (
            <Box
              key={`uploading-${i}`}
              style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid transparent' }}
            >
              <MediaThumb src={p.objectUrl} isVideo={p.isVideo} />
              <Box
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Loader size="sm" color="white" />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {media.length > 0 && (
        <Text size="xs" c="dimmed" mt={8}>Загружено: {media.length} файл(ов)</Text>
      )}
    </Box>
  );
};
