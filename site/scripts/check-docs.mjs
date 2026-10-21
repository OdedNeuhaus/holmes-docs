#!/usr/bin/env node
/**
 * Content checks for docs/: things the Docusaurus build misses (or reports unclearly).
 * No dependencies. Run from the repo root:  make check
 *
 * error → exit 1 (fails the pipeline).  warning → reported only.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DOCS = path.join(ROOT, 'docs');
const SECTIONS_FILE = path.join(ROOT, 'site/src/data/sections.tsx');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);
const DOC_EXT = new Set(['.md', '.mdx']);
const MAX_IMAGE_BYTES = 1024 * 1024;
const RENDERED_FENCES = new Set(['md', 'markdown', 'mdx', 'mermaid']);
const NAME_RE = /^_?[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)?$/;
const ADMONITIONS = 'note|tip|info|warning|danger|caution|important';
const HTML_TAGS =
  /^(br|b|i|u|s|em|strong|code|kbd|sub|sup|details|summary|p|div|span|img|a|ul|ol|li|table|tr|td|th|thead|tbody|hr|pre|mark|small|abbr|figure|figcaption|video|source)$/i;

const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\bglpat-[A-Za-z0-9_-]{20,}/, 'GitLab token'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic API key'],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/, 'OpenAI-style API key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, 'JWT'],
  [
    /\b(?:password|passwd|pwd|secret|token|api[_-]?key|client[_-]?secret)\b["']?\s*[:=]\s*["']?(?![<$*{]|x{3,}|\.\.\.|changeme|REDACTED|example|your[-_])[A-Za-z0-9+/=_\-!@#%^&]{12,}/i,
    'hard-coded credential',
  ],
];

const problems = [];
const report = (level, file, line, msg) =>
  problems.push({level, file: path.relative(ROOT, file), line, msg});

// Names starting with _ (e.g. docs/_templates) are excluded from the site, so skip them
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).filter((e) => !e.name.startsWith('_') || e.name === '_category_.json').flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? [p, ...walk(p)] : [p];
  });
}

/** Returns the file's lines, each marked with whether it is inside a code fence. */
function scanLines(text) {
  const lines = text.split('\n');
  let fence = null; // {char, len}
  let frontmatterEnd = -1;
  if (lines[0] === '---') {
    frontmatterEnd = lines.indexOf('---', 1);
  }
  return lines.map((raw, i) => {
    if (i <= frontmatterEnd) return {raw, i, kind: 'frontmatter'};
    const m = raw.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (m) {
      const [, marks, info] = m;
      if (!fence) {
        fence = {char: marks[0], len: marks.length};
        return {raw, i, kind: 'fence-open', info: info.trim()};
      }
      if (marks[0] === fence.char && marks.length >= fence.len && !info.trim()) {
        fence = null;
        return {raw, i, kind: 'fence-close'};
      }
    }
    return {raw, i, kind: fence ? 'code' : 'text'};
  });
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 4);
  if (end === -1) return null;
  const fm = {};
  for (const line of text.slice(4, end).split('\n')) {
    const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return fm;
}

const stripInline = (s) =>
  s
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ');

function checkDoc(file) {
  const text = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);
  const fm = parseFrontmatter(text);

  if (!fm) {
    report('error', file, 1, 'missing frontmatter (--- title / description ---) at the top of the file');
  } else {
    if (!fm.title) report('error', file, 1, 'missing title in frontmatter');
    if (!fm.description) report('error', file, 1, 'missing description in frontmatter');
  }

  let hebrew = 0;
  let latin = 0;
  const imageRefs = [];

  let fenceLang = '';
  for (const {raw, i, kind, info} of scanLines(text)) {
    const ln = i + 1;
    if (kind === 'fence-open') fenceLang = (info || '').split(/[\s{]/)[0].toLowerCase();

    // Hebrew belongs in prose, not in code. Markdown examples and Mermaid labels are rendered content.
    if (kind === 'code' && !RENDERED_FENCES.has(fenceLang) && /[\u05d0-\u05ea]/.test(raw)) {
      report('warning', file, ln, 'Hebrew inside a code block: keep code and comments in English, explain in the prose around it');
    }

    for (const [re, what] of SECRET_PATTERNS) {
      if (kind !== 'frontmatter' && re.test(raw)) {
        report('error', file, ln, `looks like a secret (${what}): replace with <REDACTED> or an example value`);
      }
    }

    if (kind === 'fence-open' && !info) {
      report('warning', file, ln, 'code block without a language (```bash / ```yaml / ```text ...)');
    }
    if (kind !== 'text') continue;

    if (new RegExp(`^\\s*:::(?:${ADMONITIONS})\\s+\\S`).test(raw)) {
      report('error', file, ln, 'old admonition title syntax: write :::tip[Title], not :::tip Title');
    }
    if (/^#\s/.test(raw) && fm?.title) {
      report('warning', file, ln, 'H1 heading in the page body: the title already comes from frontmatter, start at ##');
    }

    const noCode = raw.replace(/`[^`]*`/g, '');
    if (ext === '.mdx' && /^#{1,6}\s.*\{#[\w-]+\}\s*$/.test(raw)) {
      report('error', file, ln, 'in .mdx, write heading IDs as {/* #id */}, not {#id}');
    }
    if (ext === '.md') {
      if (/^import\s.+from\s/.test(raw)) {
        report('error', file, ln, 'import in a .md file: components only work in .mdx (rename the file)');
      }
      // In .md, <something> outside code is parsed as an HTML tag and vanishes from the page
      for (const [, tag] of noCode.matchAll(/<\/?([A-Za-z][A-Za-z0-9_.-]*)[^>]*>/g)) {
        if (HTML_TAGS.test(tag)) continue;
        const hint = /^[A-Z]/.test(tag) ? ' (if it is a React component, rename the file to .mdx)' : '';
        report('error', file, ln, `"<${tag}>" will vanish from the page: wrap it in backticks: \`<${tag}>\`${hint}`);
      }
    }

    for (const m of noCode.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) imageRefs.push([m[1], ln]);
    for (const m of noCode.matchAll(/\]\((\.{1,2}\/[^)\s]*files\/[^)\s]+)\)/g)) imageRefs.push([m[1], ln]);
    for (const m of noCode.matchAll(/<img[^>]*\ssrc=["']([^"']+)/g)) imageRefs.push([m[1], ln]);

    const prose = stripInline(raw);
    hebrew += (prose.match(/[\u05d0-\u05ea]/g) || []).length;
    latin += (prose.match(/[A-Za-z]/g) || []).length;
  }

  for (const [ref, ln] of imageRefs) {
    if (/^(https?:)?\/\//.test(ref)) {
      report('warning', file, ln, `external image (${ref}): store it locally in the section's img/`);
      continue;
    }
    if (ref.startsWith('/')) continue; // site/static/: Docusaurus checks these itself
    const target = path.resolve(path.dirname(file), decodeURI(ref.split('#')[0]));
    if (!fs.existsSync(target)) report('error', file, ln, `file not found: ${ref}`);
    else usedImages.add(target);
  }

  if (hebrew + latin > 200 && hebrew / (hebrew + latin) < 0.4) {
    report('warning', file, 1, 'most of the prose (outside code) is not Hebrew: the docs are written in Hebrew');
  }
}

const usedImages = new Set();
const images = [];
const attachments = [];

function checkSections() {
  const sectionsSrc = fs.existsSync(SECTIONS_FILE) ? fs.readFileSync(SECTIONS_FILE, 'utf8') : '';
  const positions = new Map();
  for (const e of fs.readdirSync(DOCS, {withFileTypes: true})) {
    if (!e.isDirectory() || e.name.startsWith('_')) continue;
    const dir = path.join(DOCS, e.name);
    const cat = path.join(dir, '_category_.json');
    if (!fs.existsSync(cat)) {
      report('error', dir, 0, 'section without _category_.json');
    } else {
      try {
        const {label, position} = JSON.parse(fs.readFileSync(cat, 'utf8'));
        if (!label) report('error', cat, 1, 'missing label');
        if (typeof position !== 'number') report('error', cat, 1, 'missing position (number)');
        else if (positions.has(position))
          report('warning', cat, 1, `duplicate position ${position} (also used by ${positions.get(position)})`);
        else positions.set(position, e.name);
      } catch (err) {
        report('error', cat, 1, `invalid JSON: ${err.message}`);
      }
    }
    if (!fs.existsSync(path.join(dir, 'index.mdx')) && !fs.existsSync(path.join(dir, 'index.md'))) {
      report('error', dir, 0, 'section without index.mdx (its landing page)');
    }
    if (!sectionsSrc.includes(`'/docs/${e.name}'`)) {
      report('warning', dir, 0, `no homepage card: add one to site/src/data/sections.tsx (to: '/docs/${e.name}')`);
    }
  }
}

for (const p of walk(DOCS)) {
  const name = path.basename(p);
  const ext = path.extname(p).toLowerCase();
  const isDir = fs.statSync(p).isDirectory();
  const inImg = p.split(path.sep).includes('img');
  const inFiles = p.split(path.sep).includes('files'); // downloadable attachments (JSON, YAML...)

  if (name !== '_category_.json' && !NAME_RE.test(name)) {
    report('error', p, 0, 'invalid name: use English, lowercase, hyphens (e.g. tool-calling-fix.md)');
  }
  if (isDir) continue;
  if (inFiles) {
    attachments.push(p);
    if (fs.statSync(p).size > MAX_IMAGE_BYTES) report('warning', p, 0, 'attachment larger than 1MB');
  } else if (DOC_EXT.has(ext)) {
    if (inImg) report('error', p, 0, 'content file inside img/');
    else checkDoc(p);
  } else if (IMAGE_EXT.has(ext)) {
    if (!inImg) report('warning', p, 0, 'image outside the section img/ folder');
    images.push(p);
    const size = fs.statSync(p).size;
    if (size > MAX_IMAGE_BYTES) {
      report('warning', p, 0, `large image (${(size / 1048576).toFixed(1)}MB): compress or downscale it`);
    }
  } else if (name !== '_category_.json') {
    report('error', p, 0, 'raw file inside docs/: convert it to a .md page, or move it to the section files/ folder if it is a download');
  }
}

checkSections();

for (const f of [...images, ...attachments]) {
  if (!usedImages.has(f)) report('warning', f, 0, 'file not referenced by any page');
}

// ─────────── output ───────────
const errors = problems.filter((p) => p.level === 'error');
const warnings = problems.filter((p) => p.level === 'warning');
const color = (c, s) => (process.stdout.isTTY ? `\x1b[${c}m${s}\x1b[0m` : s);

for (const p of [...errors, ...warnings]) {
  const loc = p.line ? `${p.file}:${p.line}` : p.file;
  const tag = p.level === 'error' ? color(31, 'error  ') : color(33, 'warning');
  console.log(`${tag} ${loc}  ${p.msg}`);
}
console.log(
  errors.length || warnings.length
    ? `\n${errors.length} errors, ${warnings.length} warnings`
    : color(32, '✓ docs look good'),
);
process.exit(errors.length ? 1 : 0);
