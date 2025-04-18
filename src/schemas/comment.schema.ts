import { z } from 'zod';

export const commentSchema = z.object({
  imageId: z.string().uuid(), // Associar o comentário à imagem
  content: z.string().min(1),
  user: z.string().email(),
});
