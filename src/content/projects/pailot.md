---
order: 2
title: PAilot
featured: true
summary: An agent that reschedules field-service technicians after disruptions, with adversarial evals that prove unsafe runs change nothing.
stack: [TypeScript, LangGraph, LLM tool calling]
date: Oct 2026
role: Agent tools and evaluations, team project
award: 2nd place (Public) and Best Agents Use Award, NUS-ISS Show Me Your Agents Hackathon
---

PAilot is an AI-assisted dispatch desk. When a technician is delayed or a job changes, it helps a coordinator rebuild the schedule.

## What I built

- **Typed LangGraph tools** that validate inputs and workflow state before anything runs. Consequential changes need a human to approve them.
- **Normal and adversarial evaluations** covering prompt injection, invalid tool calls, and stale planning data. Each eval checks which tools ran and verifies that unsafe runs left the schedule unchanged.

## Why it matters

An agent that edits real schedules has to fail safely. The evals were how we showed the judges it does.
