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

One-time setup, done once in your AWS account:

1. **Move DNS to Route 53.** In Route 53, create a public hosted zone for `eusuf.dev`. Copy its four nameservers into your domain registrar's nameserver settings. If the domain already has records you use (email, for example), recreate them in the new zone first.
2. **Create the stack in us-east-1.** In CloudFormation (region **N. Virginia, us-east-1**), create a stack from `infra/site.yml`. Set `HostedZoneId` to the zone from step 1. If your account already has a GitHub identity provider (IAM → Identity providers → `token.actions.githubusercontent.com`), set `CreateGitHubOidcProvider` to `false`. Tick the IAM acknowledgement. The certificate and CloudFront usually take 5 to 15 minutes; the certificate step waits until the nameserver change from step 1 is live.
3. **Tell GitHub where to deploy.** In this repo, open Settings → Secrets and variables → Actions → **Variables** and add three repository variables from the stack's **Outputs** tab: `AWS_ROLE_ARN`, `S3_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID`.
4. **Deploy.** Actions → Deploy → Run workflow. After that, every merge to `main` goes live on its own.

Same thing from the CLI, if you prefer:

```sh
aws route53 create-hosted-zone --name eusuf.dev --caller-reference "$(date +%s)"
aws cloudformation deploy --region us-east-1 --stack-name personal-site \
  --template-file infra/site.yml --capabilities CAPABILITY_IAM \
  --parameter-overrides HostedZoneId=<zone id>
aws cloudformation describe-stacks --region us-east-1 --stack-name personal-site --query "Stacks[0].Outputs"
```

Cost is small: the Route 53 zone is $0.50 a month, and S3 and CloudFront traffic for a personal site is usually within the free tier.
