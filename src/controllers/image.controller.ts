import { Request, Response, NextFunction } from 'express';
import { imageMetadataSchema } from '../schemas/image.schema';
import { uploadImageService, listImagesService } from '../services/image.service';

export const uploadImageController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  
  try {
    console.log('Recebendo requisição de upload de imagem');

    if (!req.file) {
      console.log('Nenhum arquivo enviado');
      res.status(400).json({ message: 'Arquivo não enviado' });
      return;
    }

    console.log('Arquivo recebido:', req.file.originalname);
    
    const parsed = imageMetadataSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('Dados inválidos:', parsed.error.flatten());
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    console.log('Dados válidos para o upload:', parsed.data);

    // Chama o serviço de upload
    const result = await uploadImageService(req.file, parsed.data);
    console.log('Upload bem-sucedido. Resultado:', result);
    
    res.status(201).json({ message: 'Upload realizado com sucesso!', data: result });
  } catch (err) {
    console.error('Erro no upload de imagem:', err);
    next(err);
  }
};

interface Image {
  id: string;
  title: string;
  user: string;
  s3Key: string;
  createdAt: string;
}

export const listImagesController = async (
  _: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Recebendo requisição para listar imagens');

    // Chama o serviço para listar as imagens
    const images = await listImagesService();

    // Modifica o serviço para incluir a URL completa da imagem no retorno
    const imagesWithUrls = images.map((image: Image) => {
    const imageUrl = `https://devcloud-s3-bucket.s3.sa-east-1.amazonaws.com/${image.s3Key}`;
    return {
      ...image, // Mantém todos os dados existentes da imagem
      url: imageUrl // Adiciona a URL completa
    };
    
  });
  console.log('Imagens listadas:', imagesWithUrls);
   
  // Envia a lista de imagens com URLs como resposta
  res.status(200).json(imagesWithUrls);
  } catch (err) {
    console.error('Erro ao listar imagens:', err);
    next(err);
  }
};
