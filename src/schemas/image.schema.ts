import { z } from 'zod';

export const imageMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  user: z.string().email(),
});
