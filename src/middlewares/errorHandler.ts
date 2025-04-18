import { Request, Response, NextFunction } from 'express';

// Middleware de tratamento de erros
export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {  // Sem retorno explícito
  console.error(err); // Logar o erro para depuração

  // Erro de sintaxe (por exemplo, erro no JSON enviado)
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'Erro de sintaxe na requisição.' });
    return; // Não retorna, apenas finaliza a resposta
  }

  // Erro de limite de tamanho de arquivo (por exemplo, com multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'O arquivo enviado é muito grande.' });
    return;
  }

  // Caso o erro seja algum outro tipo, responder com erro interno do servidor
  res.status(500).json({
    error: err.message || 'Erro interno do servidor.',
  });
};
