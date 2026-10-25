import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    // Featured projects get a card on the homepage; the rest go under "Also built"
    featured: z.boolean().default(false),
    summary: z.string(),
    stack: z.array(z.string()),
    date: z.string(),
    role: z.string().optional(),
    award: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    // Path under public/, e.g. /videos/pailot.mp4
    video: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { projects };
