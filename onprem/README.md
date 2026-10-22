<div dir="rtl">

# HolmesGPT Docs

התיעוד הטכני של מערכת HolmesGPT בארגון. ה-repo הזה מכיל רק את התוכן. מנוע האתר (Docusaurus וכל התלויות שלו) מגיע מוכן בתוך image בסיס, ולכן לא צריך Node או `npm install`, רק Docker.

## איך מוסיפים תיעוד

**עם Claude Code (מומלץ):** פותחים Claude Code בתיקייה הזו, מדביקים חומר גולמי בצ'אט או זורקים קבצים ל-`inbox/`, וכותבים `/add-docs`. Claude ישאל איפה התוכן צריך להיכנס, יכתוב עמוד מסודר בעברית, יריץ את הבדיקות וייתן קישור לתצוגה מקדימה. Merge Request הוא פותח רק אחרי שמאשרים.

**ידנית:** כל פרק הוא תיקייה בתוך `docs/`, וכל עמוד הוא קובץ `.md`. יש תבניות ב-`docs/_templates/`, והמדריך המלא נמצא באתר בעמוד **"איך כותבים תיעוד"**.

```bash
make dev      # site on http://localhost:3000, live reload on save
make check    # quick checks before opening an MR
make build    # full build, same as the pipeline
make stop     # stop the dev server
```

אם Docker לא מצליח למשוך את ה-image, מריצים פעם אחת `docker login` מול ה-registry.

## מה יש כאן

| תיקייה | מה יש בה |
|---|---|
| 📁 `docs/` | **התיעוד עצמו. כאן עובדים.** |
| 📁 `inbox/` | חומר גולמי ל-Claude (לא נכנס ל-Git) |
| 📁 `site/` | כרטיסי הפרקים בעמוד הבית. כל קובץ כאן מחליף את הקובץ באותו נתיב במנוע. |
| 📁 `deploy/` | ה-Dockerfile, nginx, Helm ו-ArgoCD |
| 📄 `CLAUDE.md`, 📁 `.claude/` | הכללים של Claude ותהליך `/add-docs` |

## איך זה נבנה ונפרס

<div dir="ltr">

```
holmesgpt-docs-base (engine: Docusaurus + node_modules, built outside this network)
        │  FROM
        ▼
MR   ──► CI: check + typecheck + build inside the base image
main ──► CI: docker build (deploy/Dockerfile) + push   (tag = short SHA)
         └► commit "[skip ci]" updating image.tag in values.yaml ──► ArgoCD syncs
```

</div>

<details>
<summary><b>למתחזקים: הקמה ראשונית ועדכון המנוע</b></summary>

### הקמה ראשונית (פעם אחת)

1. **מכניסים את image הבסיס.** מקבלים את `holmesgpt-docs-base.tar.gz` (נבנה ב-repo המלא עם `make base-save`), ודוחפים אותו ל-registry הפנימי:

   <div dir="ltr">

   ```bash
   docker load -i holmesgpt-docs-base.tar.gz
   docker tag holmesgpt-docs-base:latest registry.example.internal/holmesgpt/holmesgpt-docs-base:latest
   docker push registry.example.internal/holmesgpt/holmesgpt-docs-base:latest
   ```

   </div>

2. **מעדכנים כתובות** במקום הערכים של `example.internal`:
   - `BASE_IMAGE` ב-`Makefile` וב-`.gitlab-ci.yml`
   - ב-`.gitlab-ci.yml`: `DOCS_SITE_URL` ו-`NGINX_IMAGE`, `DOCKER_IMAGE`, `DIND_IMAGE`, `HELM_IMAGE`, `GIT_IMAGE` (ה-mirrors הפנימיים)
   - `deploy/helm/holmesgpt-docs/values.yaml`: `image.repository`, `ingress.host`, `ingress.className`, TLS
   - `deploy/argocd/application.yaml`: `repoURL` (הכתובת של ה-repo הזה), `project`
3. **משתני CI/CD** ב-GitLab (Settings → CI/CD → Variables):
   - `GITOPS_TOKEN`: Project Access Token עם `write_repository` (masked + protected). אם `main` מוגן, מאשרים ל-token לעשות push.
   - אם לא משתמשים ב-registry של GitLab: `IMAGE_REPO`, `REGISTRY`, `REGISTRY_USER`, `REGISTRY_PASSWORD`. אותו משתמש צריך גם הרשאת pull ל-`BASE_IMAGE`.
4. **Merge ראשון ל-main**: ה-CI בונה את ה-image הראשון ומעדכן את ה-tag.
5. **ArgoCD**: `kubectl apply -n argocd -f deploy/argocd/application.yaml`

### עדכון המנוע

עיצוב, עמוד הבית, גרסת Docusaurus ותלויות npm הם חלק מהמנוע, ומשנים אותם ב-repo המלא `holmesgpt-docs`. שם מריצים `make base-save`, מעבירים את הקובץ לכאן ודוחפים אותו כמו בשלב 1. מומלץ לתת לכל גרסה tag משלה (למשל `:2026-10-22`) ולעדכן את `BASE_IMAGE` ב-MR, כך שה-pipeline בודק את התוכן מול המנוע החדש לפני שהוא עולה.

שינוי קטן אפשר לעשות גם מכאן: `make eject FILE=src/css/custom.css` מעתיק את הקובץ מהמנוע ל-`site/`, ומשם הוא גובר על הגרסה שבמנוע. קובץ כזה כבר לא מתעדכן מגרסאות חדשות של המנוע, ולכן כדאי להעביר את השינוי גם ל-repo המלא.

build ידני של ה-image (מהשורש): `docker build -f deploy/Dockerfile -t holmesgpt-docs .`

</details>

</div>
