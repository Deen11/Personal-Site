# Personal Site

Deen Al Eusuf's personal site, built with [Astro](https://astro.build). Dark "Bold" style with a lime accent, a playable Game of Life in the homepage hero, and thin Game of Life strips between sections on the inner pages.

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
| Projects and case studies | `src/content/projects/*.md` (frontmatter drives the lists and case study header) |
| Homepage | `src/pages/index.astro` |
| About, Contact, Work | `src/pages/` |
| Game of Life engine | `src/scripts/life.ts` |
| Hero board / section strips | `src/components/LifeHero.astro`, `src/components/LifeDivider.astro` |
| Colors, fonts, spacing | `src/styles/global.css` |
| Email, LinkedIn, GitHub | `src/site.ts` |

## To do before launch

- Drop your resume at `public/resume.pdf`. The `/resume` nav link and the Resume row on Contact appear automatically once it exists.
- Fill the `TODO(Deen)` notes in `src/content/projects/*.md` (they are HTML comments, so they don't show on the site).
- Add screenshots or clips for each project.

## Deploy

Import the repo in [Vercel](https://vercel.com/new). It detects Astro, so no settings are needed.
