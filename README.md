<div dir="rtl">

# <img src="site/static/img/logo-circle.png" width="36" align="center" /> HolmesGPT Docs

התיעוד הטכני של מערכת HolmesGPT בארגון.

## מה יש כאן

| תיקייה | מה יש בה |
|---|---|
| 📁 `docs/` | **התיעוד עצמו. זו התיקייה היחידה שעובדים בה.** |
| 📁 `inbox/` | חומר גולמי ל-Claude (לא נכנס ל-Git) |
| 📁 `site/` | מנוע האתר (Docusaurus). לא צריך לגעת. |
| 📁 `deploy/` | Docker, Helm ו-ArgoCD. לא צריך לגעת. |

## איך מוסיפים תיעוד

**הדרך הקלה (Claude Code):** פותחים Claude Code בתיקייה הזו, מדביקים חומר גולמי או זורקים אותו ל-`inbox/`, וכותבים `/add-docs`. Claude ישאל איפה זה צריך להיכנס ויעשה את השאר.

**ידנית:** כל פרק הוא תיקייה בתוך `docs/`, וכל עמוד הוא קובץ `.md`. יש תבניות מוכנות ב-`docs/_templates/`. המדריך המלא נמצא באתר, בעמוד **"איך כותבים תיעוד"**.

```bash
make dev      # site on http://localhost:3000, live reload on save
make check    # quick check before opening an MR
```

<details>
<summary><b>למתחזקים: מבנה מלא, פריסה והקמה ראשונית</b></summary>

### המבנה המלא

```text
docs/                         content: one folder per section
├── _templates/               page templates (not published)
└── <section>/                _category_.json · index.mdx · pages · img/ · files/
inbox/                        raw material for Claude
site/                         Docusaurus
├── docusaurus.config.ts      URLs, navbar, search
├── src/css/custom.css        colors, fonts, RTL
├── src/pages/index.tsx       homepage
├── src/data/sections.tsx     homepage section cards
├── static/img/               logo and favicon
└── scripts/check-docs.mjs    make check (also runs in CI)
deploy/
├── Dockerfile                build (Node) → nginx non-root on port 8080
├── nginx.conf
├── helm/holmesgpt-docs/      Helm chart
└── argocd/application.yaml   ArgoCD Application
CLAUDE.md                     instructions for Claude
.claude/skills/add-docs/      the /add-docs workflow
.gitlab-ci.yml                MR: checks + build · main: image + tag bump
Makefile                      check / build / dev / stop
```

### איך זה נפרס

<div dir="ltr">

```
merge → main ──► GitLab CI: docker build + push  (tag = short SHA)
                └► commit "[skip ci]" updating image.tag in values.yaml
                         │
                         ▼
               ArgoCD (auto-sync) ──► Deployment + Service + Ingress
```

</div>

### הקמה ראשונית (פעם אחת)

1. **כתובות**: מחליפים את ערכי `example.internal` ב:
   - `site/docusaurus.config.ts`: `SITE_URL`, `REPO_URL`
   - `deploy/helm/holmesgpt-docs/values.yaml`: `image.repository`, `ingress.host`, `ingress.className`, TLS
   - `deploy/argocd/application.yaml`: `repoURL`, `project`
2. **Mirrors פנימיים**: ב-`.gitlab-ci.yml` מעדכנים את ה-images תחת `variables` (או מגדירים אותם כמשתני CI/CD).
3. **משתני CI/CD** ב-GitLab (Settings → CI/CD → Variables):
   - `GITOPS_TOKEN`: Project Access Token עם `write_repository` (masked + protected). אם `main` מוגן, מאשרים ל-token לעשות push.
   - `NPM_REGISTRY`: כתובת ה-npm registry הפנימי.
   - אם ה-image לא נדחף ל-registry של GitLab: `IMAGE_REPO`, `REGISTRY`, `REGISTRY_USER`, `REGISTRY_PASSWORD`.
4. **Merge ראשון ל-main**: ה-CI בונה את ה-image הראשון ומעדכן את ה-tag.
5. **ArgoCD**: `kubectl apply -n argocd -f deploy/argocd/application.yaml`

build ידני של ה-image (מהשורש): `docker build -f deploy/Dockerfile -t holmesgpt-docs .`

</details>

</div>
