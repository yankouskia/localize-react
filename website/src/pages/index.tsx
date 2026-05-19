import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './index.module.css';

const HERO_TS = `import { LocalizationProvider, useLocalize } from 'localize-react';

const translations = {
  en: { hello: 'Hi {{name}}!' },
  es: { hello: '¡Hola {{name}}!' },
  ja: { hello: '{{name}}さん、こんにちは!' },
};

function Greeting() {
  const { translate } = useLocalize();
  return <h1>{translate('hello', { name: 'Alex' })}</h1>;
}

export default function App() {
  return (
    <LocalizationProvider locale="en" translations={translations}>
      <Greeting />
    </LocalizationProvider>
  );
}`;

const STATS: Array<{ value: string; label: string; sub?: string }> = [
  { value: '< 1 kB', label: 'gzip', sub: '916 B ESM, brotli' },
  { value: '0', label: 'runtime deps' },
  { value: '100%', label: 'test coverage', sub: 'stmt/func/lines' },
  { value: 'ESM + CJS', label: 'dual published' },
];

type Feature = {
  emoji: string;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    emoji: '🪶',
    title: 'Microscopic',
    body: 'One provider, one hook, one component. The whole runtime is under a kilobyte brotli — small enough to leave in your critical path.',
  },
  {
    emoji: '🔒',
    title: 'Type-safe by default',
    body: 'Strict TypeScript 6 source. Types ship inside the package. A 10-line helper turns descriptor strings into a literal union.',
  },
  {
    emoji: '🧱',
    title: 'Boring on purpose',
    body: "No ICU, no extraction, no async runtime, no plugins. Just nested JSON, dot-paths, and {{mustache}} tokens. The kind of API you don't reread the docs for.",
  },
  {
    emoji: '⚛️',
    title: 'Plays well with React 19',
    body: 'Server-safe usage, Suspense-friendly lazy loading, hooks-era peer range (>=16.8). Tested in CI through React 19.',
  },
  {
    emoji: '🛡',
    title: 'Safe to ship',
    body: 'Verbatim string substitution — values with regex metachars render correctly. Missing keys warn and fall back instead of throwing.',
  },
  {
    emoji: '📦',
    title: 'Modern packaging',
    body: 'Dual ESM + CJS exports with correct `types` conditions. Validated by publint and arethetypeswrong on every PR.',
  },
];

const ANTI_FEATURES: string[] = [
  'No ICU MessageFormat (use Intl on top, if you need it)',
  'No automated message extraction',
  'No locale negotiation (BCP 47 matching)',
  'No date/number/plural formatting (the platform already ships them)',
];

const QUICKSTART_INSTALL = `# pick one
npm install localize-react
pnpm add localize-react
yarn add localize-react
bun add localize-react`;

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>v2 · React 19-ready · TypeScript 6</p>
          <h1 className={styles.heroTitle}>
            React i18n,
            <br />
            <span className={styles.heroAccent}>without the weight.</span>
          </h1>
          <p className={styles.heroLede}>
            <strong>localize-react</strong> is a tiny, type-safe React i18n
            library built on Context and hooks. Under a kilobyte brotli, zero
            runtime dependencies, dual-published ESM + CJS.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} to="/docs/quickstart">
              Get started →
            </Link>
            <Link className={styles.btnGhost} to="/docs/intro">
              Read the docs
            </Link>
            <Link
              className={styles.btnGhost}
              to="https://github.com/yankouskia/localize-react"
            >
              GitHub ↗
            </Link>
          </div>
          <div className={styles.statsRow}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
                {s.sub ? <div className={styles.statSub}>{s.sub}</div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroCode}>
          <div className={styles.codeChrome}>
            <span className={styles.dot} style={{ background: '#ff5f56' }} />
            <span className={styles.dot} style={{ background: '#ffbd2e' }} />
            <span className={styles.dot} style={{ background: '#27c93f' }} />
            <span className={styles.codeFile}>app.tsx</span>
          </div>
          <CodeBlock
            language="tsx"
            showLineNumbers
            className={styles.codeBlock}
          >
            {HERO_TS}
          </CodeBlock>
        </div>
      </div>
    </header>
  );
}

function Features(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>What you get</p>
        <h2 className={styles.sectionTitle}>
          Tiny on the outside, careful on the inside.
        </h2>
        <p className={styles.sectionSub}>
          Every byte and every type is intentional. Here's what you can rely on.
        </p>
      </div>
      <div className={styles.featureGrid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureEmoji} aria-hidden>
              {f.emoji}
            </div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>How it works</p>
        <h2 className={styles.sectionTitle}>
          From install to translated UI in 30 seconds.
        </h2>
      </div>
      <div className={styles.howGrid}>
        <div className={styles.step}>
          <div className={styles.stepBadge}>1</div>
          <h3>Install</h3>
          <CodeBlock language="bash">{QUICKSTART_INSTALL}</CodeBlock>
        </div>
        <div className={styles.step}>
          <div className={styles.stepBadge}>2</div>
          <h3>Define translations</h3>
          <CodeBlock language="ts">{`export const translations = {
  en: { greeting: { hello: 'Hi {{name}}!' } },
  es: { greeting: { hello: '¡Hola {{name}}!' } },
} as const;`}</CodeBlock>
        </div>
        <div className={styles.step}>
          <div className={styles.stepBadge}>3</div>
          <h3>Mount the provider</h3>
          <CodeBlock language="tsx">{`<LocalizationProvider
  locale="en"
  translations={translations}
>
  <App />
</LocalizationProvider>`}</CodeBlock>
        </div>
        <div className={styles.step}>
          <div className={styles.stepBadge}>4</div>
          <h3>Translate</h3>
          <CodeBlock language="tsx">{`const { translate } = useLocalize();
return <h1>{translate('greeting.hello', { name: 'Alex' })}</h1>;`}</CodeBlock>
        </div>
      </div>
    </section>
  );
}

function NotIncluded(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Honest scope</p>
        <h2 className={styles.sectionTitle}>
          What's intentionally <em>not</em> in the box.
        </h2>
        <p className={styles.sectionSub}>
          If you need any of these, prefer a heavier library. We deliberately
          stay small so you can compose what you need on top.
        </p>
      </div>
      <ul className={styles.antiList}>
        {ANTI_FEATURES.map((line) => (
          <li key={line} className={styles.antiItem}>
            <span className={styles.antiMark} aria-hidden>
              ✕
            </span>
            {line}
          </li>
        ))}
      </ul>
      <p className={styles.antiFoot}>
        See <Link to="/docs/why">Why localize-react?</Link> for the full
        reasoning, and{' '}
        <Link to="/docs/recipes/intl-formatters">the Intl recipe</Link> for
        plurals/currency/dates with platform APIs.
      </p>
    </section>
  );
}

function FinalCTA(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.cta}`}>
      <h2 className={styles.ctaTitle}>Ready in two minutes.</h2>
      <p className={styles.ctaSub}>
        Translate one component first. Add more languages whenever.
      </p>
      <div className={styles.heroActions} style={{ justifyContent: 'center' }}>
        <Link className={styles.btnPrimary} to="/docs/quickstart">
          Start with the Quickstart →
        </Link>
        <Link
          className={styles.btnGhost}
          to="https://github.com/yankouskia/localize-react"
        >
          Star on GitHub ★
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — ${siteConfig.tagline}`}
      description="Tiny (< 1 kB), type-safe React i18n built on Context and hooks. Dual ESM + CJS, zero runtime dependencies, React 19 ready."
    >
      <Hero />
      <main>
        <Features />
        <HowItWorks />
        <NotIncluded />
        <FinalCTA />
      </main>
    </Layout>
  );
}
