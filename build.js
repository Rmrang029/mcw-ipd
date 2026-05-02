#!/usr/bin/env node
/**
 * MCW IPD Microsite — Build Script
 *
 * Encrypts every .html in /site (including /site/projects) using StatiCrypt
 * and writes the deployable output to /docs (which GitHub Pages serves).
 *
 *   Run:  node build.js
 *
 * After running, commit and push the /docs folder. GitHub Pages should be
 * configured to serve from the /docs folder of the main branch.
 *
 * Edit content in /site (cleartext). Re-run this script to re-encrypt.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'site');
const OUT = path.join(ROOT, 'docs');

// ---- Configuration ---------------------------------------------------------

const PASSWORD = process.env.MCW_GATE_PASSWORD || 'mcw2026';

const STATICRYPT_OPTS = [
  '--short',
  '--remember', '0',                      // session-only (not persisted to localStorage)
  '--template', path.join(SRC, 'gate-template.html'),  // custom MCW-branded gate
  '--template-title', 'MCW VEC — Confidential Preview',
  '--template-color-primary', '#00863F',  // MCW Green (button)
  '--template-color-secondary', '#00863F',// MCW Green (page background behind the card)
  '--template-button', 'Enter',
  '--template-instructions', 'Enter the password to view this confidential MCW preview.',
  '--template-placeholder', 'Password',
  '--template-error', 'Incorrect password — try again.',
  '--template-remember', 'Remember me on this device',
];

// ---- Helpers ---------------------------------------------------------------

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dst, item);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function walkHtml(dir, base = '') {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'assets') continue;
    if (item === 'gate-template.html') continue;  // not a content page; used by staticrypt
    const full = path.join(dir, item);
    const rel = base ? path.join(base, item) : item;
    if (fs.statSync(full).isDirectory()) {
      out.push(...walkHtml(full, rel));
    } else if (item.endsWith('.html')) {
      out.push({ srcAbs: full, rel });
    }
  }
  return out;
}

function shellArgs(args) {
  // Escape each arg for shell
  return args.map(a => `'${String(a).replace(/'/g, "'\\''")}'`).join(' ');
}

// ---- Build -----------------------------------------------------------------

console.log(`\nMCW IPD site build`);
console.log(`-------------------`);
console.log(`Source: ${SRC}`);
console.log(`Output: ${OUT}`);
console.log(`Password: ${PASSWORD === 'mcw2026' ? 'mcw2026 (default)' : '[from MCW_GATE_PASSWORD]'}\n`);

// 1. Ensure output exists (we overwrite files in place rather than delete the
//    directory, since some host environments restrict directory removal in
//    mounted workspace folders)
fs.mkdirSync(OUT, { recursive: true });

// 2. Copy assets unencrypted (CSS, JS, images — these are not secret)
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
console.log(`✔ Copied assets/`);

// 3. Encrypt every HTML file
const htmlFiles = walkHtml(SRC);
console.log(`Encrypting ${htmlFiles.length} HTML files...\n`);

for (const f of htmlFiles) {
  const outDir = path.join(OUT, path.dirname(f.rel));
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const cmd = [
    'npx', 'staticrypt',
    f.srcAbs,
    '-p', PASSWORD,
    ...STATICRYPT_OPTS,
    '-d', outDir,
  ];

  try {
    execSync(shellArgs(cmd), { stdio: 'pipe', cwd: ROOT });
    console.log(`  ✔ ${f.rel}`);
  } catch (e) {
    console.error(`  ✘ ${f.rel}`);
    console.error(e.stderr ? e.stderr.toString() : e.message);
    process.exit(1);
  }
}

// 4. Copy home.html → index.html so GitHub Pages serves it as default
fs.copyFileSync(path.join(OUT, 'home.html'), path.join(OUT, 'index.html'));
console.log(`\n✔ Copied home.html → index.html (entry point)`);

// 5. Add a robots.txt to discourage indexing
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`✔ Wrote robots.txt`);

// 6. Add a CNAME placeholder note (commented in README)
console.log(`\nDone. Push the /docs folder to GitHub.\n`);
console.log(`Next steps:`);
console.log(`  1. git add docs && git commit -m "build" && git push`);
console.log(`  2. In GitHub repo settings, set Pages source to "main" branch, /docs folder.`);
console.log(`  3. Visit your-username.github.io/repo-name/`);
console.log(`  4. Enter password: ${PASSWORD}\n`);
