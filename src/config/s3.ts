// Configuração do cliente S3
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';  // Importando o dotenv para carregar variáveis de ambiente de forma segura

// Carregar as variáveis de ambiente a partir do arquivo .env
// Isso é essencial para não expor dados sensíveis no código-fonte, como as credenciais da AWS.
dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
