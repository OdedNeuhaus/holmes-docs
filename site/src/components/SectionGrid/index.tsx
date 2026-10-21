import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import {sections, type Section} from '@site/src/data/sections';
import styles from './styles.module.css';

function SectionCard({title, description, to, icon}: Section): ReactNode {
  return (
    <Link to={to} className={styles.card}>
      <span className={styles.cardIcon} aria-hidden>
        {icon}
      </span>
      <Heading as="h3" className={styles.cardTitle}>
        {title}
      </Heading>
      <p className={styles.cardDesc}>{description}</p>
      <span className={styles.cardArrow} aria-hidden>
        ←
      </span>
    </Link>
  );
}

/** Card grid of all doc sections (defined in src/data/sections.tsx). */
export default function SectionGrid(): ReactNode {
  return (
    <div className={styles.cards}>
      {sections.map((s) => (
        <SectionCard key={s.to} {...s} />
      ))}
    </div>
  );
}
