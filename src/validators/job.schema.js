import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  company: z.string().min(2),
  location: z.string().min(2),
  salary: z.number().optional(),
});
