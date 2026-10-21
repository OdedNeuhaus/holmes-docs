import {execSync} from 'node:child_process';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// ─────────────────────────────────────────────────────────────
// Values to adjust for your environment
// ─────────────────────────────────────────────────────────────
const SITE_URL = 'https://holmesgpt-docs.example.internal';
const REPO_URL = 'https://gitlab.example.internal/your-group/holmesgpt-docs';
const DEFAULT_BRANCH = 'main';

// "Last updated by" needs git history. Without git, or with no commits yet, turn it off.
const IN_GIT = (() => {
  try {
    execSync('git rev-parse --verify HEAD', {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
})();

const config: Config = {
  title: 'HolmesGPT',
  tagline: 'התיעוד הטכני של מערכת HolmesGPT בארגון',
  favicon: 'img/favicon.ico',

  url: SITE_URL,
  baseUrl: '/',
  trailingSlash: false,

  future: {
    v4: true,
  },

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'he',
    locales: ['he'],
    localeConfigs: {
      he: {label: 'עברית', direction: 'rtl', htmlLang: 'he-IL'},
    },
  },

  markdown: {
    // .md = plain Markdown (tolerates { and < in text). .mdx = MDX (only when imports/components are needed).
    format: 'detect',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  clientModules: ['./src/clientModules/fonts.ts'],

  headTags: [
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#11383a'}},
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // Content lives in docs/ at the repo root, outside the site folder
          path: '../docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: ({docPath}) => `${REPO_URL}/-/edit/${DEFAULT_BRANCH}/docs/${docPath}`,
          showLastUpdateTime: IN_GIT,
          showLastUpdateAuthor: IN_GIT,
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        language: ['he', 'en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    navbar: {
      title: 'HolmesGPT',
      hideOnScroll: false,
      logo: {
        alt: 'HolmesGPT',
        src: 'img/logo-circle.png',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'התיעוד'},
        {to: '/docs/contributing', position: 'left', label: 'איך כותבים'},
        {href: REPO_URL, position: 'right', label: 'GitLab', 'aria-label': 'GitLab repository'},
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'HolmesGPT',
        src: 'img/logo-circle.png',
        width: 48,
        height: 48,
      },
      links: [
        {
          title: 'התיעוד',
          items: [
            {label: 'ברוכים הבאים', to: '/docs'},
            {label: 'איך כותבים תיעוד', to: '/docs/contributing'},
          ],
        },
        {
          title: 'קישורים',
          items: [
            {label: 'ה-Repository של התיעוד', href: REPO_URL},
            {label: 'HolmesGPT (upstream)', href: 'https://github.com/robusta-dev/holmesgpt'},
            {label: 'Open WebUI (upstream)', href: 'https://github.com/open-webui/open-webui'},
          ],
        },
      ],
      copyright: `HolmesGPT · תיעוד פנימי · ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'docker', 'ini', 'toml', 'promql', 'nginx'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
