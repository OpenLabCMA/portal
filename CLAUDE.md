# CLAUDE.md - CMA OpenLab Website

## Project Overview

Static HTML/CSS/JS website for the CMA OpenLab at HKUST(GZ). Deployed on GitHub Pages as a plain static site (no build step).

- **Live site**: https://openlabcma.github.io/cma-openlab/
- **Repo**: https://github.com/OpenLabCMA/cma-openlab
- **Team**: Margaret Minsky (faculty), Nicolo Merendino (faculty), Yuri Kuzmin (lab manager / primary dev)
- All three push directly to `main` — no branches or PRs needed at this scale

## Deployment

- **Host**: GitHub Pages, deployed directly from `main` branch root
- **Build type**: Legacy (no Jekyll, no GitHub Actions)
- **`.nojekyll`**: Present in repo root — tells GitHub Pages to skip Jekyll processing
- Changes pushed to `main` go live automatically within ~1 minute
- To manually trigger a rebuild: `gh api repos/OpenLabCMA/cma-openlab/pages/builds -X POST`

## Cache Busting

CSS and JS are linked with version query strings (`styles.css?v=2`, `script.js?v=2`). **When you change styles.css or script.js, bump the version number in index.html** or Safari (especially iOS) will serve stale files. This is the single most common reason changes "don't work."

## File Structure

```
cma-openlab/
├── .nojekyll        # Prevents Jekyll processing
├── index.html       # Single-page app with tabbed interface
├── styles.css       # All styles, including responsive mobile layout
├── script.js        # Tab switcher, dynamic positioning, turtle backgrounds
├── images/          # All image assets
│   ├── logo.png     # Site logo (top bar)
│   ├── hero.png     # Background image (CSS, desktop only)
│   ├── heroc.png
│   ├── ye.jpg       # Projects gallery
│   ├── turtl1.png   # Random tab backgrounds (JS, desktop only)
│   ├── turtl2.png
│   └── turtl3.png
├── CLAUDE.md        # This file (instructions for Claude Code)
└── README.md
```

## How the Layout Works

This is important context for making changes:

- **Everything is `position: fixed`** — the top bar, tabs, panels, and bottom bar are all fixed overlays stacked by z-index
- **JavaScript positions elements dynamically** — `script.js` measures the top bar height with `getBoundingClientRect()`, positions the tabs below it, then positions the panels below the tabs. This runs on load, resize, and orientation change
- **Tab content lives inside a single `<p>` tag** per panel — the CSS uses `white-space: pre-wrap` (desktop) or `pre-line` (mobile) to render line breaks from the HTML source. This means the indentation in the HTML source code appears as visual indentation on desktop
- **Do NOT use semantic HTML (h2, ul, li) inside tab panels** — the CSS and JS are built around the `<p>` tag. Adding other elements will break the layout, positioning, and fade transitions
- **The "Report Problem" button** is a `mailto:` link to margaretm@hkust-gz.edu.cn, floating bottom-right

## Image Paths

All image references use **relative paths** from the repo root:
- HTML: `images/logo.png`
- CSS: `./images/hero.png`
- JS: `` images/${filename} ``

Do NOT prefix paths with the repo name (`cma-openlab/images/...`) — GitHub Pages handles the base path automatically.

## Mobile Responsive Design

Two breakpoints:
- **768px** — tablets and large phones
- **480px** — small phones

Key mobile differences:
- Tab panels use `position: static` (not fixed) so content scrolls naturally
- `white-space: pre-line` collapses HTML source indentation while preserving line breaks
- Tabs scroll horizontally in a single row (swipe to reach Wiki, Inventory)
- Hero/turtle background images are hidden (too small to see)
- Top bar, tabs, and report button are sized down

## Gotchas

- **Safari iOS caching**: Bump `?v=N` in index.html when changing CSS/JS (see Cache Busting above)
- **Tab content formatting**: Use plain text inside `<p>` tags, not HTML elements. Line breaks in the source become visible line breaks. Keep lines short to avoid ugly wrapping on mobile
- **`position: fixed` everywhere**: Adding new elements may require explicit z-index values. See `:root` in styles.css for the z-index scale
- **The JS overrides CSS `top` values**: Don't rely on CSS `top` for positioning `.top-tabs` or `.tab-panel` — the JS sets these at runtime

## Converting to Jekyll

If you later want Jekyll features (layouts, includes, Markdown content pages, blog posts), follow these steps:

### 1. Add `_config.yml`

Create `_config.yml` in the repo root:

```yaml
title: CMA OpenLab
description: Collaborative initiative for creative experimentation and open research
url: https://openlabcma.github.io
baseurl: /cma-openlab

# Exclude files Jekyll doesn't need to process
exclude:
  - README.md
  - CLAUDE.md
```

### 2. Delete `.nojekyll`

Remove the `.nojekyll` file so Jekyll processing is enabled.

### 3. Update image paths to use `baseurl`

Replace hardcoded relative paths with Jekyll's `baseurl` variable:

**HTML (in any `.html` file):**
```html
<!-- Before -->
<img src="images/logo.png" alt="CMA OpenLab" />

<!-- After -->
<img src="{{ site.baseurl }}/images/logo.png" alt="CMA OpenLab" />
```

**CSS (move inline or use a `.scss` file):**
```scss
// In a .scss file (Jekyll processes these automatically)
body::before {
  background-image: url("{{ site.baseurl }}/images/hero.png");
}
```

Note: Jekyll doesn't process plain `.css` files for Liquid tags. Either:
- Rename `styles.css` to `styles.scss` and add `---\n---` (empty front matter) at the top, OR
- Keep CSS as-is with relative paths (`./images/hero.png`) which still works

**JS:** Keep relative paths in `script.js` — they resolve correctly from `index.html`.

### 4. Create layouts (optional)

Create `_layouts/default.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ page.title | default: site.title }}</title>
    <link rel="stylesheet" href="{{ site.baseurl }}/styles.css" />
</head>
<body>
    {{ content }}
    <script src="{{ site.baseurl }}/script.js" defer></script>
</body>
</html>
```

Then in `index.html`, replace the boilerplate with front matter:
```html
---
layout: default
title: Welcome to the CMA OpenLab!
---
<div class="top-bar">
    ...rest of body content...
</div>
```

### 5. Switch Pages deployment back to GitHub Actions

Go to **Settings > Pages** and change source from "Deploy from a branch" to "GitHub Actions", then select the Jekyll workflow. Or use the API:

```bash
gh api repos/OpenLabCMA/cma-openlab/pages -X PUT \
  --input <(echo '{"build_type":"workflow"}')
```

### 6. Test locally (optional)

```bash
gem install bundler jekyll
bundle init
bundle add jekyll github-pages
bundle exec jekyll serve
# Open http://localhost:4000/cma-openlab/
```
