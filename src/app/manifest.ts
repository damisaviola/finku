import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DompetKu — Pelacak Keuangan Pribadi',
    short_name: 'DompetKu',
    description: 'Aplikasi pencatatan, anggaran, dan pelacak keuangan pribadi yang cepat, akurat, dan modern.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    background_color: '#09090b',
    theme_color: '#f59e0b',
    orientation: 'portrait-primary',
    lang: 'id',
    dir: 'ltr',
    categories: ['finance', 'productivity', 'utilities'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Catat Transaksi',
        short_name: 'Transaksi',
        description: 'Buka form pencatatan transaksi baru',
        url: '/transactions',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Lihat Anggaran',
        short_name: 'Anggaran',
        description: 'Pantau sisa pagu anggaran bulanan',
        url: '/budgets',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Target Tabungan',
        short_name: 'Tabungan',
        description: 'Lihat perkembangan impian finansial',
        url: '/goals',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
