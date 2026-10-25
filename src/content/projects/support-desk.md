---
order: 3
title: Cloud AI customer support desk
featured: true
summary: A help desk that automates tier-1 telecom support with LLM query classification and hands tickets to human agents.
stack: [AWS CloudFormation, DynamoDB, CloudWatch, EC2, LLM]
date: Mar 2026
---

A cloud-native help desk for tier-1 telecom support. An LLM classifies each query, answers what it can, and escalates the rest as tickets to human agents.

## What I built

- **Infrastructure as code.** CloudFormation provisions a VPC across two availability zones, a load balancer, and auto scaling from 2 to 4 instances, with CloudWatch alarms.
- **Data and security.** I owned the DynamoDB schema (4 tables, encrypted at rest), IAM policies, security groups, bcrypt-hashed staff logins, and server-side secret handling.
