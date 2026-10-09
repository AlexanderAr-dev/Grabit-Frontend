import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import '@mantine/core/styles.css';

async function bootstrap() {
  // Условие с import.meta.env проверяется при сборке — в обычный бандл моки не попадают
  if (import.meta.env.MODE === 'demo') {
    try {
      const { enableDemoMode } = await import(
        './app/mocks/browser'
      );
      await enableDemoMode();
    } catch (error) {
      // Нет Service Worker (http по IP, приватный режим) — рендерим без моков, а не белый экран
      console.error('[demo] MSW не запустился', error);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
