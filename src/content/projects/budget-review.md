---
order: 1
title: Budget review assistant
group: ai
featured: true
summary: GovTech · Audits from about two months to one week
stack: Bedrock · FastAPI · React · AWS
headline: An AI reviewer that
headlineAccent: shows its evidence.
intro: An internal GovTech app that checks funding submissions and workbooks against financial and policy rules, and links every answer back to where it came from.
facts:
  - label: Role
    value: Software engineer, end to end
  - label: Stack
    value: React · FastAPI · Bedrock
  - label: Infra
    value: Docker · ECS · ECR · S3
  - label: Timeline
    value: May 2026 – now
results:
  - value: 2 mo → 1 wk
    label: Audit turnaround
  - value: '3'
    label: AWS environments shipped
flow:
  - Submission + workbook
  - Retrieve passages and cells
  - Bedrock assistant
  - Server-side calc tools
  - Cited answer
  - Reviewer approves
---

## The problem

Completed budget audits were taking around two months. Reviewers had to check each funding submission and its workbooks against a long list of financial and policy rules.

<!-- TODO(Deen): two or three sentences in your own words on who the reviewers are and what a typical audit looked like. -->

## How it works

**Evidence retrieval.** The Amazon Bedrock assistant pulls document passages and spreadsheet cells, and every answer is checked against those sources.

**Calculation tools.** Numbers are worked out by server-side tools rather than by the model, so totals and ratios can be trusted.

**Rules in plain language.** Reviewers describe a check in words or with a workbook example. The app drafts it as a structured rule, validates it, previews it against real data, and only publishes it once a reviewer approves that version.

## What I built

I owned the application end to end, from turning reviewer needs into checks through to the React and TypeScript front end, the FastAPI and Python back end, and deployment across three AWS environments with Docker, ECS, ECR and S3. The workflows were refined through rounds of reviewer feedback.

<!-- TODO(Deen): add a "What I learned" section with one honest takeaway. -->
