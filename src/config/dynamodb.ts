import { DynamoDBClient } from '@aws-sdk/client-dynamodb';  // Importando o cliente DynamoDB para interagir com o serviço DynamoDB da AWS
import dotenv from 'dotenv';  // Importando o dotenv para carregar variáveis de ambiente de forma segura

// Carregar as variáveis de ambiente a partir do arquivo .env
// Isso é essencial para não expor dados sensíveis no código-fonte, como as credenciais da AWS.
dotenv.config();

console.log(process.env.AWS_ACCESS_KEY_ID);

export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
