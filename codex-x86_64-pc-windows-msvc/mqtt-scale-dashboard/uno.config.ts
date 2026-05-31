import { defineConfig, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.1,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      brand: {
        50: '#ecfdf5',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
      },
    },
  },
  shortcuts: {
    'toolbar-btn':
      'h-9 min-w-9 inline-flex items-center justify-center rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50',
  },
});
