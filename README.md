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

## Deploy (AWS)

The site is hosted at [eusuf.dev](https://eusuf.dev) on S3 and CloudFront. Every push to `main` builds the site and uploads it with [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). GitHub signs in to AWS with a short-lived token, so there are no AWS keys stored anywhere. The AWS side is one CloudFormation stack, [`infra/site.yml`](infra/site.yml).

DNS stays at Cloudflare, where the domain is registered. One-time setup:

1. **Create the stack in us-east-1.** In CloudFormation (region **N. Virginia, us-east-1**), create a stack from `infra/site.yml`. If your account already has a GitHub identity provider (IAM → Identity providers → `token.actions.githubusercontent.com`), set `CreateGitHubOidcProvider` to `false`. Tick the IAM acknowledgement.
2. **Validate the certificate.** While the stack is creating, open Certificate Manager in us-east-1. The pending certificate lists two CNAME records, one for `eusuf.dev` and one for `www.eusuf.dev`. Add both in Cloudflare (DNS → Records) with the proxy turned **off** (grey cloud). The stack carries on by itself once AWS sees them, usually within a few minutes, and CloudFront then takes another 5 to 10.
3. **Point the domain at CloudFront.** From the stack's **Outputs**, copy `CloudFrontDomain` (it ends in `cloudfront.net`). In Cloudflare, add a CNAME for `eusuf.dev` (name `@`) and another for `www`, both pointing at it with the proxy **off**. Cloudflare handles a CNAME on the bare domain for you.
4. **Tell GitHub where to deploy.** In this repo, open Settings → Secrets and variables → Actions → **Variables** and add three repository variables from the same Outputs tab: `AWS_ROLE_ARN`, `S3_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID`.
5. **Deploy.** Actions → Deploy → Run workflow. After that, every merge to `main` goes live on its own.

Keep the proxy off on these records: CloudFront already serves the site over HTTPS from edge locations, and putting Cloudflare's proxy in front of it adds a second cache that the deploy can't clear.

From the CLI, step 1 and the outputs are:

```sh
aws cloudformation deploy --region us-east-1 --stack-name personal-site \
  --template-file infra/site.yml --capabilities CAPABILITY_IAM
aws cloudformation describe-stacks --region us-east-1 --stack-name personal-site --query "Stacks[0].Outputs"
```

Cost is small: S3 and CloudFront traffic for a personal site usually stays within the free tier, and DNS is free at Cloudflare.
