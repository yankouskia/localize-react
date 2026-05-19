import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'localize-react',
  tagline: 'Tiny, type-safe React i18n. < 1 kB. Zero deps.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
    faster: true,
  },

  url: 'https://yankouskia.github.io',
  baseUrl: '/localize-react/',

  organizationName: 'yankouskia',
  projectName: 'localize-react',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/yankouskia/localize-react/tree/master/website/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'react, i18n, localization, typescript, hooks, lightweight, context',
      },
      {
        name: 'description',
        content:
          'Tiny (< 1 kB), type-safe React i18n built on Context and hooks. Dual ESM/CJS, zero runtime dependencies.',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'v2-launch',
      content:
        '🎉 <strong>v2 is here</strong> — strict TypeScript, dual ESM+CJS, React 19 ready. <a href="/localize-react/docs/migration-v2">Read the migration guide →</a>',
      backgroundColor: '#6e56cf',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'localize-react',
      hideOnScroll: true,
      logo: {
        alt: 'localize-react',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/docs/quickstart', label: 'Quickstart', position: 'left' },
        { to: '/docs/api', label: 'API', position: 'left' },
        { to: '/docs/recipes', label: 'Recipes', position: 'left' },
        {
          href: 'https://www.npmjs.com/package/localize-react',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/yankouskia/localize-react',
          'aria-label': 'GitHub repository',
          className: 'header-github-link',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Quickstart', to: '/docs/quickstart' },
            { label: 'API reference', to: '/docs/api' },
            { label: 'Recipes', to: '/docs/recipes' },
            { label: 'Migration v1 → v2', to: '/docs/migration-v2' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/yankouskia/localize-react/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/yankouskia/localize-react/issues',
            },
            {
              label: 'Sponsor',
              href: 'https://github.com/sponsors/yankouskia',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/localize-react',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/yankouskia/localize-react',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/yankouskia/localize-react/releases',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Aliaksandr Yankouski. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'json', 'diff'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
