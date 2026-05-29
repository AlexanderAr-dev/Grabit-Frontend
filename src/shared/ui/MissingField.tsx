export const MissingField = ({ label }: { label?: string }) => (
  <span
    style={{
      display: 'inline-block',
      background: '#e03131',
      color: '#fff',
      padding: '1px 8px',
      borderRadius: '4px',
      fontWeight: 500,
      fontSize: 'inherit',
    }}
    title="Данные отсутствуют в API бекенда"
  >
    {label ?? '—'}
  </span>
);
