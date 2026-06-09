import { FC } from 'react';

interface ProBadgeProps {
  size?: 'sm' | 'md';
}

export const ProBadge: FC<ProBadgeProps> = ({ size = 'sm' }) => {
  const fontSize = size === 'sm' ? 10 : 12;
  const px = size === 'sm' ? '5px' : '7px';
  const py = size === 'sm' ? '2px' : '3px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FF8104 0%, #FF5C00 100%)',
        color: '#fff',
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        letterSpacing: '0.04em',
        borderRadius: 4,
        padding: `${py} ${px}`,
        verticalAlign: 'middle',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(255,128,4,0.35)',
      }}
    >
      PRO
    </span>
  );
};
