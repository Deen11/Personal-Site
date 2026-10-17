---
order: 2
title: PAilot
group: ai
featured: true
summary: Dispatch agents with adversarial evals · 2nd place, NUS-ISS
stack: LangGraph · TypeScript
headline: Agents that leave the schedule
headlineAccent: alone when they should.
intro: An AI-assisted dispatch desk that helps coordinators reschedule field-service technicians after disruptions, built at the NUS-ISS Show Me Your Agents Hackathon.
facts:
  - label: Role
    value: Agent tools and evals
  - label: Stack
    value: TypeScript · LangGraph
  - label: Team
    value: Team project
  - label: Timeline
    value: Oct 2026
results:
  - value: 2nd
    label: Public category
  - value: Best
    label: Agents Use award
flow:
  - Disruption comes in
  - Agent proposes a new plan
  - Input validation
  - Approval check
  - Coordinator confirms
---

## The problem

When a technician is delayed or a job falls through, a coordinator has to reshuffle the day by hand. An agent can do that quickly, but only if it never makes the schedule worse.

## How it works

I developed the LangGraph agent tools that read and change the schedule. Every tool call goes through input validation and an approval check before anything is written.

## Testing it like an attacker

Alongside normal scenarios, I designed adversarial evaluations for prompt injection, invalid tool calls and stale planning data. The pass condition for an unsafe run was simple: the schedule must be left unchanged.

<!-- TODO(Deen): add a screenshot or a short eval replay, and what you'd do next. -->
