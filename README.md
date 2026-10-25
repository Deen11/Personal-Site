# Personal Site

Deen Al Eusuf's personal site at [eusuf.dev](https://eusuf.dev), built with [Astro](https://astro.build). It's a static site with no client-side JavaScript, light and dark themes that follow the visitor's system setting, and a page per project.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Needs Node 22.12 or newer.

## Where things live

| What | Where |
| --- | --- |
| Projects | `src/content/projects/*.md` (frontmatter drives the cards; the body is the project page) |
| Experience, skills, education, awards, contact links | `src/site.ts` |
| Homepage | `src/pages/index.astro` |
| Project pages | `src/pages/projects/[slug].astro` |
| Colors, fonts, spacing | `src/styles/global.css` |

To add a project, copy one of the files in `src/content/projects/`. Set `featured: true` for a homepage card; others are listed under "Also built".

## Resume and demo videos

- Drop your resume at `public/resume.pdf`. The Resume links in the nav, hero and contact section appear on the next build once the file exists.
- For a demo video, put the file in `public/videos/` (for example `public/videos/pailot.mp4`) and add `video: /videos/pailot.mp4` to that project's frontmatter. Keep videos under 25 MB, which is Cloudflare's per-file limit, or host them on YouTube and add a `links` entry instead.

## Deploy (Cloudflare)

The domain is registered at Cloudflare, so the site is hosted there too, as a Worker that serves the static build. `wrangler.jsonc` points it at `dist/`. One-time setup:

1. In the Cloudflare dashboard, open **Workers & Pages → Create → Import a repository**, and pick `Deen11/personal-site`.
2. Name the project `personal-site` (it must match `name` in `wrangler.jsonc`). Keep **Build command** `npm run build`, **Deploy command** `npx wrangler deploy`, and **Root directory** `/`. The `.node-version` file tells Cloudflare to use Node 22.
3. Save and deploy. You get a `*.workers.dev` URL.
4. In the Worker, open **Settings → Domains & Routes → Add → Custom domain**, and add `eusuf.dev`, then `www.eusuf.dev`. Cloudflare creates the DNS records itself because the domain is in the same account.

After that, every push to `main` goes live.
