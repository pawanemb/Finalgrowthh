import * as z from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  url: z.string().url("Please enter a valid URL"),
  industry: z.string().min(1, "Industry is required"),
  services: z.array(z.string()).optional(),
  target_audience: z.object({
    age: z.array(z.number()).optional(),
    gender: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
  }).optional(),
});