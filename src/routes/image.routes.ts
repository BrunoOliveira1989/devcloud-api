// src/routes/image.routes.ts
import { Router } from 'express';
import { uploadImageController, listImagesController } from '../controllers/image.controller';
import  {upload}  from '../middlewares/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadImageController);
router.get('/', listImagesController);

// Exporte o router como nomeado
export { router as imageRoutes };
