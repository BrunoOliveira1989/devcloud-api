import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Importações internas
import { connectRedis } from './config/redis';
import { imageRoutes } from './routes/image.routes';
import { commentRoutes } from './routes/comment.routes';
import { errorHandler } from './middlewares/errorHandler';

// Configuração do dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verifica se o Redis está habilitado
const REDIS_ENABLED = process.env.ENABLE_REDIS === 'true';

if (REDIS_ENABLED) {
  // Conectar com o Redis
  connectRedis();
}

// Criação da aplicação Express
const app = express();

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/images', imageRoutes);
app.use('/api/comments', commentRoutes);

// Healthcheck (rota para verificar a saúde da aplicação)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
