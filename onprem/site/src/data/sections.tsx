import type {ReactNode} from 'react';

/**
 * Section cards shown on the homepage and the /docs welcome page.
 * When adding a new section under docs/, add an entry here (optional, but recommended).
 * Icons: SVG from https://lucide.dev (copy the icon's child elements into <Icon>).
 */
export type Section = {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
};

function Icon({children}: {children: ReactNode}): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const sections: Section[] = [
  {
    title: 'פתיחה',
    description: 'איך התחיל פרויקט HolmesGPT, מה מטרת העל שלו ולמה נכתב התיעוד הזה.',
    to: '/docs/opening',
    icon: (
      <Icon>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </Icon>
    ),
  },
  {
    title: 'ארכיטקטורה',
    description: 'תמונת-על של המערכת: הרכיבים, איך הם מדברים זה עם זה ולמה בנינו את זה ככה.',
    to: '/docs/architecture',
    icon: (
      <Icon>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </Icon>
    ),
  },
  {
    title: 'Skills',
    description: 'היכולות שהוספנו ל-Holmes: toolsets, runbooks ואינטגרציות.',
    to: '/docs/skills',
    icon: (
      <Icon>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </Icon>
    ),
  },
  {
    title: 'דשבורדים ב-Grafana',
    description: 'הדשבורדים שמנטרים את המערכת: מה כל פאנל אומר ואיפה ה-JSON שלהם.',
    to: '/docs/dashboards',
    icon: (
      <Icon>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </Icon>
    ),
  },
  {
    title: 'פריסה',
    description: 'איך Holmes נפרס: charts, ArgoCD, סביבות, סודות ותהליך השחרור.',
    to: '/docs/deployment',
    icon: (
      <Icon>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </Icon>
    ),
  },
  {
    title: 'תפעול ותקלות',
    description: 'Runbooks, תקלות מוכרות ואיך מאבחנים כשמשהו לא עובד.',
    to: '/docs/operations',
    icon: (
      <Icon>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </Icon>
    ),
  },
  {
    title: 'Benchmarks & Evaluations',
    description: 'איך אנחנו מודדים את Holmes: Benchmarks, Evaluations ו-Stress Tests.',
    to: '/docs/benchmarks',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </Icon>
    ),
  },
  {
    title: 'Holmes בראי יחידה 8200',
    description: 'הפרויקט מנקודת המבט של יחידה 8200, כולל סאגת משאבי ה-Holmes היחידתיים.',
    to: '/docs/unit-8200',
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </Icon>
    ),
  },
  {
    title: 'שדרוג גרסאות ב-HolmesGPT',
    description: 'איך משדרגים את HolmesGPT לגרסה חדשה, ומה חשוב לבדוק בדרך.',
    to: '/docs/upgrades',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="m16 12-4-4-4 4" />
        <path d="M12 16V8" />
      </Icon>
    ),
  },
  {
    title: 'הנבחרת',
    description: 'האנשים שעובדים על Holmes, ומה תחום האחריות של כל אחד מהם.',
    to: '/docs/team',
    icon: (
      <Icon>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
  {
    title: 'איך כותבים תיעוד',
    description: 'המדריך להרחבת האתר הזה: עמודים, פרקים, תמונות, דיאגרמות ו-Git flow.',
    to: '/docs/contributing',
    icon: (
      <Icon>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </Icon>
    ),
  },
];
