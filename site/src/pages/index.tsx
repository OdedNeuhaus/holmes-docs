import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import SectionGrid from '@site/src/components/SectionGrid';
import styles from './index.module.css';

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.glow} aria-hidden />
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroText}>
          <Heading as="h1" className={styles.title}>
            HolmesGPT
            <span className={styles.titleAccent}>אצלנו בארגון</span>
          </Heading>
          <p className={styles.subtitle}>
            התיעוד המלא של HolmesGPT, כל מה שתצטרכו לדעת על מנת להמשיך לפתח ולהבין את המערכת.
          </p>
          <div className={styles.actions}>
            <Link className={clsx('button button--lg', styles.primaryBtn)} to="/docs">
              תסביר
            </Link>
            <Link className={clsx('button button--lg', styles.ghostBtn)} to="/docs/contributing">
              איך מוסיפים לפה דברים?
            </Link>
          </div>
        </div>

        <div className={styles.badgeWrap} aria-hidden>
          <div className={styles.ring} />
          <div className={styles.ring2} />
          <img className={styles.badge} src={useBaseUrl('/img/logo-circle.png')} alt="" />
        </div>
      </div>

      <div className={clsx('container', styles.terminalWrap)}>
        <div className={styles.terminal} dir="ltr">
          <div className={styles.terminalBar}>
            <span />
            <span />
            <span />
          </div>
          <code className={styles.terminalLine}>
            <span className={styles.prompt}>$</span> holmes ask{' '}
            <span className={styles.typing}>"why is my pod crashing?"</span>
            <span className={styles.cursor} />
          </code>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout title="ראשי" description="התיעוד הטכני של מערכת HolmesGPT בארגון">
      <Hero />
      <main className={styles.main}>
        <div className="container">
          <Heading as="h2" className={styles.sectionHeading}>
            רכיבי המערכת
          </Heading>
          <SectionGrid />
        </div>
      </main>
    </Layout>
  );
}
