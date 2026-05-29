import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'quickstart',
    'why',
    {
      type: 'category',
      label: 'Guides',
      collapsible: true,
      collapsed: false,
      items: [
        'guides/provider',
        'guides/translate',
        'guides/interpolation',
        'guides/locale-resolution',
        'guides/fallbacks',
        'guides/typescript',
        'guides/type-safe-api',
      ],
    },
    {
      type: 'category',
      label: 'Recipes',
      link: { type: 'doc', id: 'recipes/index' },
      collapsible: true,
      collapsed: false,
      items: [
        'recipes/switching-locales',
        'recipes/lazy-loading',
        'recipes/nextjs',
        'recipes/vite',
        'recipes/testing',
        'recipes/intl-formatters',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      link: { type: 'doc', id: 'api/index' },
      collapsible: true,
      collapsed: false,
      items: [
        'api/localization-provider',
        'api/use-localize',
        'api/message',
        'api/types',
      ],
    },
    'migration-v2',
    'faq',
  ],
};

export default sidebars;
