import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    snippet: z.string(),
    category: z.string(),
    order: z.number(),
    featured: z.boolean(),
    url: z.string().url().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number(),
    }),
    tags: z.array(z.string()),
  }),
});

export const collections = { projects };
