import { Router } from 'express';
import { addCommentController, listCommentsController } from '../controllers/comment.controller';

const router = Router();

// Rota para adicionar comentário
router.post('/', addCommentController);

// Rota para listar comentários por imagem
router.get('/:imageId', listCommentsController);

// Exportação nomeada
export { router as commentRoutes };
