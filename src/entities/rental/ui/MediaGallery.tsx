import { useState } from 'react';
import { ActionIcon, Box, Group, Image, Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

import { IMediaType } from '@shared/types';

const MOBILE_HEIGHT = 260;
const DESKTOP_WIDTH = 400;

interface MediaGalleryProps {
  media: IMediaType[];
}

const isVideoItem = (item: IMediaType) =>
  item.mediaType?.startsWith('video') || /\.(mp4|webm|mov)(\?|$)/i.test(item.url);

function MediaItem({
  item,
  height,
  fit = 'cover',
  onClick,
}: {
  item: IMediaType;
  height: number | string;
  fit?: 'cover' | 'contain';
  onClick?: () => void;
}) {
  if (isVideoItem(item)) {
    return (
      <video
        src={item.url}
        controls
        style={{ width: '100%', height, objectFit: fit, borderRadius: 10, display: 'block' }}
      />
    );
  }
  return (
    <Image
      src={item.url}
      h={height}
      w="100%"
      style={{ objectFit: fit, cursor: onClick ? 'zoom-in' : undefined, display: 'block' }}
      fallbackSrc="https://via.placeholder.com/400"
      onClick={onClick}
    />
  );
}

function NavArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const btnStyle = { background: 'rgba(0,0,0,0.55)', zIndex: 2 };
  return (
    <>
      <ActionIcon
        pos="absolute"
        left={8}
        top="50%"
        style={{ ...btnStyle, transform: 'translateY(-50%)' }}
        radius="xl"
        size="lg"
        onClick={onPrev}
      >
        <IconChevronLeft size={18} />
      </ActionIcon>
      <ActionIcon
        pos="absolute"
        right={8}
        top="50%"
        style={{ ...btnStyle, transform: 'translateY(-50%)' }}
        radius="xl"
        size="lg"
        onClick={onNext}
      >
        <IconChevronRight size={18} />
      </ActionIcon>
    </>
  );
}

function DotsIndicator({
  count,
  current,
  onSelect,
}: {
  count: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <Group
      pos="absolute"
      bottom={12}
      gap={6}
      style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          style={{
            width: i === current ? 12 : 8,
            height: 8,
            borderRadius: '50%',
            background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onClick={() => onSelect(i)}
        />
      ))}
    </Group>
  );
}

export const MediaGallery = ({ media }: MediaGalleryProps) => {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 576px)');

  const items = media.length > 0 ? media : [{ id: 0, url: 'https://via.placeholder.com/400' }];
  const showControls = items.length > 1;

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <>
      <Box
        pos="relative"
        style={{
          flexShrink: 0,
          overflow: 'hidden',
          // На мобильном: полная ширина, фиксированная высота (не прыгает при загрузке)
          // На десктопе: фиксированная ширина, высота растягивается по соседней карточке
          width: isMobile ? '100%' : DESKTOP_WIDTH,
          height: isMobile ? MOBILE_HEIGHT : undefined,
          alignSelf: isMobile ? undefined : 'stretch',
          background: 'var(--mantine-color-default)',
        }}
      >
        <MediaItem
          item={items[current]}
          height={isMobile ? MOBILE_HEIGHT : '100%'}
          onClick={() => setFullscreen(true)}
        />
        {showControls && <NavArrows onPrev={prev} onNext={next} />}
        {showControls && (
          <DotsIndicator count={items.length} current={current} onSelect={setCurrent} />
        )}
      </Box>

      <Modal
        opened={fullscreen}
        onClose={() => setFullscreen(false)}
        size="xl"
        fullScreen={!!isMobile}
        centered
        withCloseButton={false}
        padding={0}
        styles={{ body: { padding: 0, position: 'relative', height: isMobile ? '100%' : undefined } }}
      >
        <Box pos="relative" style={{ minHeight: isMobile ? '100%' : 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          <ActionIcon
            pos="absolute"
            top={8}
            right={8}
            style={{ background: 'rgba(0,0,0,0.55)', zIndex: 10 }}
            radius="xl"
            size="lg"
            onClick={() => setFullscreen(false)}
          >
            <IconX size={18} />
          </ActionIcon>

          <MediaItem item={items[current]} height={isMobile ? '90dvh' : '75vh'} fit="contain" />

          {showControls && <NavArrows onPrev={prev} onNext={next} />}
          {showControls && (
            <DotsIndicator count={items.length} current={current} onSelect={setCurrent} />
          )}
        </Box>
      </Modal>
    </>
  );
};
