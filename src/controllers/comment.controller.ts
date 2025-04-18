import { Request, Response, NextFunction } from 'express';
import { commentSchema } from '../schemas/comment.schema';
import { addCommentService, listCommentsService } from '../services/comment.service';

// Controlador para adicionar um comentário
export const addCommentController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {  // Não retorna nada explicitamente (Promise<void>)
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      // Retorna a resposta diretamente, mas não a "retorna" da função
      res.status(400).json({ error: parsed.error.flatten() });
      return; // Após enviar a resposta, a função termina
    }

    const { imageId, content, user } = parsed.data;
    const result = await addCommentService(imageId, content, user);

    // Manipula a resposta sem retornar nada explicitamente
    res.status(201).json({ message: 'Comentário adicionado com sucesso!', data: result });
  } catch (err) {
    // Passa o erro para o middleware de erro
    next(err);
  }
};

// Controlador para listar os comentários
export const listCommentsController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {  // Não retorna nada explicitamente (Promise<void>)
  try {
    const { imageId } = req.params;
    const comments = await listCommentsService(imageId);

    // Manipula a resposta sem retornar nada explicitamente
    res.status(200).json(comments);
  } catch (err) {
    // Passa o erro para o middleware de erro
    next(err);
  }
};
