# Spa Invitation Website

A dependency-free static site. It works on Cloudflare Pages, Vercel, Netlify, GitHub Pages, or any static host.

## Cloudflare Pages

Recommended settings:

- Framework preset: None
- Build command: leave blank
- Build output directory: `/` or project root

You can also use Cloudflare Pages Direct Upload by uploading this folder.

## Vercel

Import the folder/repository as a static project. No build command is needed.

## Local preview

From inside this folder:

```bash
python -m http.server 4173
```

Then open http://localhost:4173
