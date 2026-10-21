---
name: add-docs
description: Turn raw material (pasted notes, English text, logs, YAML, screenshots, files in inbox/, or rough files dropped into docs/) into polished Hebrew Docusaurus pages in the right place in the HolmesGPT docs, or edit existing pages. Use whenever a developer wants to add, document, write up, move, or update documentation content, even if they don't mention the skill.
---

# /add-docs: from raw material to a published Hebrew page

The developer's time is expensive. They give you raw content, and you own everything else: placement, structure, Hebrew, formatting, validation. Ask **one** well-formed question about placement, not a stream of small ones. All conventions referenced here are defined in `CLAUDE.md`. Follow them exactly.

**Talk to the developer in English**: questions, progress updates, summaries, the closing message. Do this even if they write to you in Hebrew. Only the **docs content** you write into `docs/` is Hebrew.

## 1. Collect the input

Check every source. The developer may have used more than one.

- **The message itself:** pasted text, or pasted images (use the `[Image: source: <path>]` path to get the file).
- **Arguments:** a path or free text passed to `/add-docs`.
- **`inbox/`:** `ls -la inbox/`. Everything except `README.md` and `.gitignore` is input.
- **Git changes the developer made directly:**
  ```bash
  git status --porcelain --untracked-files=all -- docs inbox site/src/data
  git diff -- docs
  ```
  Look for:
  - Non-`.md` files in `docs/` (such as `notes.txt` or `dump.yaml`).
  - Pages without frontmatter, or with Hebrew or space-containing file names.
  - Rough text appended to an existing page.
  - A new folder under `docs/`, which is a new-section candidate.

  **Where they put it is a strong placement signal. Use it as your recommendation.**

Read every input fully, including every image. If there is nothing to work with, ask the developer to paste it or drop it in `inbox/`, then stop.

**Empty files:** the developer edits `inbox/` files in VS Code, and a 0-byte file almost always means the buffer isn't saved yet (odd suffixes such as `.rtl.extenion` come from an editor extension; treat them as normal text input). Check the size with `stat`. If it's empty, do any work that doesn't depend on the content, then check the size again before stopping to ask them to save (Ctrl+S).

**Renamed old files:** the developer sometimes renames an already-processed inbox file for the next topic before pasting the new text. If the content (or the byte size) matches a page you already published, it's stale. Don't process it again; ask them to save the new text.

**"Ignore inbox/"** means exactly that: don't list or read it, and work only from the chat message.

## 2. Understand and plan (silently)

1. Run `ls -R docs/` and read the `description` of each section's `index.mdx`. Sections may have been added after CLAUDE.md was written.
2. Decide what the content **is**: a patch, skill, dashboard, runbook, architecture decision, deployment detail, UI config, or general. Map it to a section using the table in CLAUDE.md.
3. Search for overlap with `grep -ril "<key terms>" docs/`. If a page already covers this topic, **appending or updating beats creating a near-duplicate**.
4. If the input covers several distinct topics, plan a **split** into several pages.
5. Draft: the target path(s), a kebab-case slug, a Hebrew title, and the template to use.
6. Note which **essential** facts are missing. Essential means the page would be wrong or useless without them.

## 3. Ask once (placement + blocking gaps)

Use `AskUserQuestion`. One placement question, recommended option first and marked "(Recommended)", with English labels showing concrete paths:

- `New page: docs/upgrades/tool-calling-fix.md` (Recommended)
- `Add to existing page: docs/architecture/holmesgpt.md`, only if a real related page exists
- `New section: docs/<slug>/ ("<Hebrew label>")`, when nothing fits
- `Split into N pages: ...`, when you planned a split. List the pages in the option description.

The developer can always choose "Other" to type a different placement.

In the **same** `AskUserQuestion` call, add at most two more questions: one per essential missing fact you couldn't find in the repo (for example "Which HolmesGPT version was this patch applied to?"). Don't ask about things you can decide yourself: title wording, formatting, structure, sidebar order.

The developer uses "chapter", "paragraph" and "folder" loosely. Read them by context:

- "Add a paragraph about X" or "a new chapter called X", with no parent: a **new top-level section**. "Just create the paragraph" means an empty section with the placeholder and nothing else.
- "Add a paragraph under <section> called X", or "another page under <section>": a **page** in that section (`docs/<section>/<slug>.md`), filled from the inbox file.
- "Make X a folder and put the doc there": add the doc as a page in section X.

Order pages in a section to follow how a request flows through the system when that is the obvious logic (architecture: Open-WebUI → Pipe Function → HolmesGPT).

Skip the placement question only if the developer already stated the exact placement. If they dropped a file into a section folder, still confirm, with that section as the recommended option. Asking is cheap and a wrong placement is not.

When they stated the placement but parts of the input also fit another section (for example model history that also fits `opening/`, or patches that also fit `upgrades/`), follow their placement as one page and **mention the overlap in the summary** with an offer to move parts later. Don't ask, and don't split on your own.

## 4. Write the page

1. Start from the matching `docs/_templates/*.md`. Keep only the headings the content fills. **Delete the template's HTML comment and any empty headings.**
2. Fill in the frontmatter: `title`, one-sentence Hebrew `description`, and `sidebar_position` (look at siblings; the next free number, or wherever it logically belongs).
   - **A page about a named component or product is titled with that name only**, spelled as the developer spells it (`title: Open-WebUI`, not `ממשק המשתמש (Open-WebUI)`). If the input starts with a title line, use it. Don't add a `sidebar_label` that differs from the title.
3. Body: a 1–2 sentence summary, then `##` sections. There is no H1.
   - **Don't invent headings.** Add a heading only where the input clearly changes topic. Short narrative text (a foreword, a story of how something started) stays as plain paragraphs. A small aside inside a flow (such as "what is MTTR?") is a `###`, not a `##`.
4. Apply the CLAUDE.md rules:
   - Hebrew voice (מריצים / פותחים), English technical terms with the ה- / ב- prefix, bidi safety.
   - **No definite "ה-" on product and proper names at the start of a sentence.** Write "Holmes מגיע עם...", "HolmesGPT הוא...", not "ה-Holmes" or "ה-HolmesGPT". This applies to Holmes, HolmesGPT, Open-WebUI, Pipe Function, Icinga, Simple and the like. Mid-sentence prepositions stay ("ל-Holmes", "ש-Holmes", "ב-Open-WebUI"), and generic technical nouns keep "ה-" ("ה-Pod", "ה-Chart", "ה-UI", "ה-MCP").
   - **Never separate two English words with only a colon or comma** ("מול Simple: Holmes משתמש"). They merge into one left-to-right run and display in the wrong order. Put Hebrew between them ("מול Simple היא ש-Holmes משתמש"). After writing, scan with `grep -nP '[A-Za-z][:,] +[A-Za-z]' <page>`. Inline code is safe, since it's isolated.
   - Code blocks with a language, commands separated from output, no `$ ` prompts, secrets redacted.
   - Images copied into `img/` with kebab-case names and Hebrew alt text.
   - Attachments in `files/`.
   - Mermaid **only** for flows the input actually describes.
   - Admonitions in bracket syntax, used **rarely**. Don't turn the developer's statements into callout boxes. A known issue, a caveat or an opinion they wrote as a sentence stays a plain paragraph. Use a box only for something that is truly dangerous (data loss, outage, security).
   - **Table cells and list items that are a product or component name hold just the name** (`PostgreSQL`, `Redis`). Don't pad them with Hebrew words like "מסד" or "שרת" to satisfy the bidi rule; a bare name renders fine.
   - Explicit English ID on any heading you link to: `{#id}` in `.md`, `{/* #id */}` in `.mdx`.
5. **Preserve every technical detail from the input.** Rewrite for clarity and structure, but never drop commands, values, versions or caveats. Never invent any.
   - **Missing non-essential detail goes in your chat summary, not on the page.** Don't put `:::note[חסר מידע]` boxes on pages (the developer deletes them). When the input gives examples ("for example, 2 means... and 7 means..."), that is a deliberate choice, not a gap. Use an on-page note only if the page would actively mislead without it, and say so in the summary.
   - **Keep the author's voice** in narrative and history pages (a foreword, "why we chose X", what we changed and why): first person ("התחלנו", "אפרט") and their tone and slang (for example "כטרמפ", "פתב״ס"). Fix typos (MMTR → MTTR, PostresQL → PostgreSQL) and grammar, and drop pure filler ("ובלה בלה בלה", smileys). The impersonal "מריצים" voice is for instructions and runbooks.
   - **Obvious slips get fixed silently but reported:** typos, a wrong name that the next sentence contradicts (for example "ה-CLI של Holmes" when the text is about Simple's CLI), and relative dates ("לפני חודש", "נכון להיום") turned into absolute ones ("נכון לספטמבר 2026"). If a slang word is unclear ("בידלנו"), pick the likely meaning and ask about it in the summary.
   - Strip invisible Unicode characters (U+2060 word joiners and the like) that come with pasted text.
6. If the input contains secrets, redact them and **tell the developer** what you redacted and where it came from. They may need to rotate it.
7. **Editing an existing page:** make the minimal change, keep its structure and voice, and polish only what you touch. If the developer appended rough text to a page, rewrite that part in place.
8. **Text the developer dictates in chat** ("add: ...", "just write ...") goes in **word for word**. Only add the punctuation it needs, and fix clear typos and grammar slips ("איזהו" → "איזשהו"), then list those fixes in the summary. Put it exactly where they said. With no position given, "add to page X" goes at the end of the most related section, before a sign-off such as "קריאה מהנה!". If they ask for a warning box, use `:::warning` with no custom title unless they give one.
9. **Images:** for a stock or watermarked image (such as something downloaded from Google Images), recommend redrawing it as your own SVG in `img/` with Hebrew labels, on a white rounded card so it stays readable in dark mode. To preview it, render with `python3 -c "import cairosvg; ..."` and Read the PNG. cairosvg doesn't apply bidi, so Hebrew looks reversed there; browsers render it correctly. Add `direction="rtl"` to the Hebrew `<text>` elements.

## 5. Integrate

- **Converted a raw file that was in `docs/`?** Remove the raw original (`git rm` if tracked, otherwise delete) so `make check` passes. You confirmed the placement in step 3, so this is expected.
- **First real page in a section?** Delete the `:::info[הפרק הזה עוד לא נכתב]` placeholder from that section's `index.mdx`.
- **New section?** Create all four pieces (folder, `_category_.json`, `index.mdx`, `site/src/data/sections.tsx` entry). See CLAUDE.md. A section that should come before `architecture` (position 1) gets a fractional position such as `0.5` rather than renumbering every section.
- **Short single-topic section** (such as a foreword)? Put the content straight into its `index.mdx` rather than creating an `index.mdx` plus one page.
- **Section landing pages** (`index.mdx`): don't repeat the frontmatter `description` as a sentence in the body. The developer finds it redundant. A landing page is just the title and `<SectionPages />` (plus the placeholder while empty, or real content if any).
- **Removing a section:** delete its folder, its card in `site/src/data/sections.tsx`, its mention in the folder tree in `docs/contributing/index.mdx`, and its row in the CLAUDE.md section table (move its "what goes here" to the section that absorbs it). Then `grep -rn "docs/<slug>"` for leftovers.
- **Cross-links:** if an existing page clearly relates, add one short relative link from it to the new page, and back. Don't go on a linking spree.

## 6. Validate (mandatory)

```bash
make check    # fix every error; fix warnings or explain why not
make build    # must end with [SUCCESS]
```

Iterate until both are green. Common fixes:

- A vanishing `<tag>`: wrap it in backticks.
- A broken link: use a relative path with the extension.
- An MDX parse error in a `.mdx` file: wrap `{` and `<` in backticks, or switch the page to `.md` if it has no components.

## 7. Preview and report

1. Make sure the dev server is up. Run `curl -sf -o /dev/null http://localhost:3000/`. If that fails, start `make dev` as a **background** command and poll until it responds.
2. Report briefly:
   - The files you created, changed or removed.
   - Anything you redacted.
   - Gaps you noticed in the input (missing values, unexplained terms), as a short list in the chat.
   - Any remaining warnings.
   - If there are processed files in `inbox/`, offer to delete them.
3. **Always end your turn with the closing message.** Make it the last thing in the reply, with the real page URL(s):

   > The site is running locally: http://localhost:3000/docs/<section>/<slug>
   > If you like it, I can open a Merge Request.

   Don't commit, push or open anything until the developer says yes. If they ask for changes, apply them, re-run step 6, and end with the closing message again.

## Look and feel fixes

The developer reviews the rendered site and sends screenshots of anything that looks off. Fix the cause in `site/src/css/custom.css` once, for the whole site, not with a per-page workaround:

- Find the element's real class in `site/node_modules/@docusaurus/theme-classic/lib/theme/...` and prefer the stable `theme-*` class names (`ThemeClassNames` in `@docusaurus/theme-common`) over hashed CSS-module names.
- Check that the rule made it into `site/build/assets/css/*.css` after `make build`, and ask them to hard-refresh (Ctrl+Shift+R).
- Already fixed: doc-card titles no longer inherit the article `h2` margin and underline, and card descriptions wrap instead of being cut off with "…".

## 8. Open the Merge Request (only after the developer says yes)

```bash
git switch -c docs/<slug>              # skip if already on a docs/ branch
git add docs/ site/src/data/sections.tsx   # plus anything else you changed: site/src/css/, CLAUDE.md, this skill
git commit -m "docs(<section>): <short English summary>"
git push -u origin docs/<slug> \
  -o merge_request.create \
  -o merge_request.target=main \
  -o merge_request.remove_source_branch \
  -o merge_request.title="docs(<section>): <short English summary>"
```

- GitLab push options create the MR without `glab`. If `glab` is installed and authenticated, `glab mr create --fill --target-branch main` also works.
- GitLab prints the MR URL in the push output. Give it to the developer.
- If the push fails (no `origin` remote, no permission to push branches), show the error and stop. Don't retry with force, and don't change remotes.
- After it merges, CI builds and ArgoCD deploys automatically. Nothing else is needed.
