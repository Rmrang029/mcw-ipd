# MCW Vancouver — IPD Experience Microsite

Confidential preview site highlighting MCW's Integrated Project Delivery (IPD) experience, the Vancouver leadership team, and how MCW executes IPD pursuits.

Hosted on **GitHub Pages** with a **client-side password gate** (`mcw2026`).

---

## What this is

A static, multi-page HTML site built from the source content in:

- `MCW IPD Experience.pdf` (marketing PDF with eight IPD/alt-delivery project profiles)
- `Master Documents/Master Resume List.docx` (Vancouver office staff bios)
- `Master Documents/MCW Proposal Branding Direction.docx` (brand standards)
- `Headshots/` (team photos for each of the 7 featured personnel)

The site has 13 pages:

| Page | File | Purpose |
|---|---|---|
| Gate | `index.html` | Encrypted entry — enter password to unlock |
| Home | `home.html` | Positioning + featured experience |
| Approach | `approach.html` | How MCW executes IPD |
| Experience | `experience.html` | Filterable grid of all 8 projects |
| Team | `team.html` | 7 Vancouver leaders with bios + photos |
| Contact | `contact.html` | Engagement details + national network |
| 8 Project pages | `projects/*.html` | One detail page per IPD project |

All pages are encrypted with `mcw2026`. Once the password is entered, navigation works seamlessly across pages within the session.

---

## Folder structure

```
26 - MCW Collab Website/
├── site/                    Cleartext SOURCE (edit content here)
│   ├── home.html
│   ├── approach.html
│   ├── experience.html
│   ├── team.html
│   ├── contact.html
│   ├── projects/            8 project detail pages
│   └── assets/
│       ├── styles.css       MCW-branded stylesheet
│       ├── site.js          Mobile nav + filter
│       └── team/            7 headshot JPGs
│
├── docs/                    BUILD output (deploy this to GitHub Pages)
│   ├── index.html           Encrypted home (entry point)
│   ├── home.html            Encrypted
│   ├── approach.html        Encrypted
│   ├── ...                  All other pages encrypted
│   ├── projects/            Encrypted project pages
│   ├── assets/              Unencrypted (CSS, JS, images)
│   └── robots.txt           Discourages search indexing
│
├── build.js                 Encryption build script (Node.js)
├── package.json             Declares staticrypt dependency
├── README.md                This file
│
├── MCW IPD Experience.pdf   Source: marketing PDF
├── Headshots/               Source: team photos
└── Master Documents/        Source: bios, project list, branding
```

---

## How to use

### Edit content

Open the file in `site/` you want to change. Edit it as plain HTML. **Do not edit anything in `docs/`** — that folder is overwritten on every build.

### Re-build (re-encrypt everything)

```bash
cd "/path/to/26 - MCW Collab Website"
node build.js
```

Output:

```
✔ Copied assets/
Encrypting 13 HTML files...
  ✔ approach.html
  ✔ contact.html
  ...
✔ Copied home.html → index.html (entry point)
✔ Wrote robots.txt
Done. Push the /docs folder to GitHub.
```

### Push to GitHub

```bash
git add docs/
git commit -m "Update site content"
git push
```

GitHub Pages will redeploy automatically.

---

## First-time setup (one-time)

### 1. Install dependencies

```bash
npm install
```

This installs StatiCrypt (the encryption tool). You only need to do this once.

### 2. Create the GitHub repository

Create a private or public repo on GitHub. **Suggestion: keep it private** even though the encrypted content is the only thing pushed — it adds a layer of obscurity.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**.
2. Under **Source**, select **Deploy from a branch**.
3. Set branch to `main` and folder to `/docs`.
4. Click **Save**.

GitHub will build the site and give you a URL like `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

### 4. Test it

1. Visit the URL.
2. You should see the password gate.
3. Enter `mcw2026`.
4. The home page should load.

---

## Changing the password

The password is `mcw2026`. To change it, set the environment variable before running build:

```bash
MCW_GATE_PASSWORD="newpassword2026" node build.js
```

Or edit the default in `build.js`:

```javascript
const PASSWORD = process.env.MCW_GATE_PASSWORD || 'mcw2026';
```

After changing, run `node build.js` and push the new `docs/` folder.

---

## Adding a new project page

1. Copy an existing file in `site/projects/` and rename it (e.g., `new-project.html`).
2. Edit the content — title, location, role, and project details.
3. Add a new `<a class="project-card">` block to `site/experience.html` and `site/home.html` (if featuring it on the home page).
4. Run `node build.js`.
5. Commit and push.

---

## Adding or replacing a team member

1. Save a square or near-square headshot to `site/assets/team/` as `firstname-lastname.jpg`. Recommended: 600×600 px, ~50 KB.
2. Open `site/team.html`.
3. Copy an existing `<div class="team-card">` block.
4. Update name, role, credentials, bio, and photo path.
5. Run `node build.js` and push.

---

## Security — read this carefully

This site uses **client-side password protection (StatiCrypt)**, not server-side authentication. Important implications:

- **Strong enough for a soft client gate.** Casual visitors cannot view content without the password. Even view-source shows ciphertext.
- **NOT a vault.** A determined attacker with the URL could brute-force a 7-character lowercase password (`mcw2026`) in hours to days using a dedicated tool. This is acceptable for marketing content; **do not** put truly confidential material on this site.
- **Robots.txt + noindex meta** discourages search engines, but does not prevent crawling by every bot.
- **GitHub repo visibility.** If the repo is public, anyone can see the encrypted source. The encryption still holds, but make the repo private for an extra layer of obscurity.

If you ever need to share something more sensitive than a marketing preview, consider:
- Cloudflare Access in front of the GitHub Pages domain (free tier, real auth).
- Netlify or Vercel with proper authentication.
- A traditional staging environment behind VPN/SSO.

---

## Brand standards applied

The site is built to MCW's official brand standards:

- **Primary color:** MCW Green `#00863F` (Pantone 7733 UP).
- **Body text:** Process Black 80% `#58595B` — never pure black.
- **Emphasis text:** Process Black 100% `#231F20`.
- **Typography:** Arial.
- **Style:** Flat modern humanist; no green gradients or 3D effects.
- **Footer city list:** Toronto, Vancouver, Calgary, Edmonton, Winnipeg, Ottawa, Saint John, Moncton, Halifax (per corporate template).

Edit `site/assets/styles.css` if the brand standards change.

---

## Troubleshooting

**The build fails with "Cannot find module 'staticrypt'"**
Run `npm install` first.

**The site renders but every page asks for the password again**
StatiCrypt remembers the password in `sessionStorage`, which is per-tab. If you open in a new tab, you'll re-enter. To persist across browser restarts, change `--remember 0` in `build.js` to `--remember 30` (days). Not recommended for shared computers.

**Pages don't update on GitHub after pushing**
GitHub Pages can take 1–5 minutes to redeploy. Check **Settings → Pages** for the deployment status.

**"Bad password" even though I'm entering it correctly**
Make sure you ran `node build.js` after any password change. The hash is baked into every file.

---

## Confidential

This site, its source content, and the team information herein are confidential. Not for redistribution outside the intended audience.

&copy; MCW Consultants Ltd. — Vancouver Office
