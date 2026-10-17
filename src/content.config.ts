import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    group: z.enum(['ai', 'systems']),
    featured: z.boolean().default(false),
    // One line for project lists
    summary: z.string(),
    stack: z.string(),
    // Case study header
    headline: z.string(),
    headlineAccent: z.string(),
    intro: z.string(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
    results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    flow: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
