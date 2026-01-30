# CLAUDE.md - CMA OpenLab Website

## Project Overview

Static HTML/CSS/JS website for the CMA OpenLab at HKUST(GZ). Deployed on GitHub Pages as a plain static site (no build step).

- **Live site**: https://openlabcma.github.io/cma-openlab/
- **Repo**: https://github.com/OpenLabCMA/cma-openlab

## Deployment

- **Host**: GitHub Pages, deployed directly from `main` branch root
- **Build type**: Legacy (no Jekyll, no GitHub Actions)
- **`.nojekyll`**: Present in repo root — tells GitHub Pages to skip Jekyll processing
- Changes pushed to `main` go live automatically within ~1 minute

## File Structure

```
cma-openlab/
├── .nojekyll        # Prevents Jekyll processing
├── index.html       # Single-page app with tabbed interface
├── styles.css       # All styles, including hero background image
├── script.js        # Tab switcher with turtle background images
├── images/          # All image assets
│   ├── logo.png     # Site logo (top bar + bottom bar)
│   ├── hero.png     # Background image (CSS)
│   ├── heroc.png
│   ├── ye.jpg       # Projects gallery
│   ├── turtl1.png   # Random tab backgrounds (JS)
│   ├── turtl2.png
│   └── turtl3.png
└── README.md
```

## Image Paths

All image references use **relative paths** from the repo root:
- HTML: `images/logo.png`
- CSS: `./images/hero.png`
- JS: `` images/${filename} ``

Do NOT prefix paths with the repo name (`cma-openlab/images/...`) — GitHub Pages handles the base path automatically.

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
