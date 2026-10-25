---
order: 1
title: AI-assisted budget review platform
featured: true
summary: Bedrock document interpretation paired with deterministic financial and policy checks. Helped cut audit turnaround from about two months to one week.
stack: [React, TypeScript, FastAPI, Amazon Bedrock, AWS ECS, Lambda, GitLab CI/CD]
date: May 2026 – Present
role: AI Software Engineer Intern, GovTech
note: Internal government tool, so there are no screenshots or code.
---

A government review team checked IT funding submissions and cost workbooks by hand, and each audit took about two months. I designed and built a platform that pairs Amazon Bedrock document interpretation with deterministic financial and policy checks. It helped bring that turnaround down to about one week.

## What I built

- **A tool-calling assistant.** It retrieves source evidence, calls server-side calculation tools instead of doing arithmetic in the model, and re-audits its own suggested corrections for new errors before a reviewer approves them.
- **Rules reviewers can write themselves.** Reviewers describe a check in plain language or with workbook examples. Drafts are validated and previewed on saved submissions before each version is approved and published.
- **The deployment.** Docker images versioned in ECR and run on ECS across three AWS environments, S3 for front-end assets and documents, Lambda and API Gateway for serverless pieces, GitLab CI/CD for builds, and least-privilege IAM roles scoped to Bedrock and S3.

## What I learned

The model was the easy part. Most of the work went into making its output checkable: grounding every answer in a source, keeping calculations deterministic, and giving reviewers a clear way to approve or reject a change.
