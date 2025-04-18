import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../config/s3';
import { dynamoClient } from '../config/dynamodb';
import { getRedisClient } from '../config/redis';
import dotenv from 'dotenv';  // Importando o dotenv para carregar variáveis de ambiente de forma segura


dotenv.config();

const BUCKET = process.env.S3_BUCKET_NAME!;
const TABLE_NAME = process.env.DYNAMO_IMAGES_TABLE!;
const REDIS_ENABLED = process.env.ENABLE_REDIS === 'true';


export async function uploadImageService(file: Express.Multer.File, metadata: any) {
  const id = uuidv4();
  const key = `uploads/${id}-${file.originalname}`;

  // Logando as informações que serão enviadas para o DynamoDB
  console.log('Gravando no DynamoDB com os seguintes dados:', {
    id,
    title: metadata.title,
    description: metadata.description || '',
    user: metadata.user,
    s3Key: key,
    createdAt: new Date().toISOString(),
  });

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));




  await dynamoClient.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id: { S: id },
      title: { S: metadata.title },
      description: { S: metadata.description || '' },
      user: { S: metadata.user },
      s3Key: { S: key },
      createdAt: { S: new Date().toISOString() },
    },
  }));


  // Invalida cache se o Redis estiver habilitado
  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    await redis.del('images:list');
  }

  return { id, key };
}

export async function listImagesService() {
  const cacheKey = 'images:list';

  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const result = await dynamoClient.send(new ScanCommand({ TableName: TABLE_NAME }));

  const items = result.Items?.map((item) => ({
    id: item.id.S,
    title: item.title.S,
    description: item.description?.S,
    user: item.user.S,
    s3Key: item.s3Key.S,
    createdAt: item.createdAt.S,
  })) || [];

  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    await redis.set(cacheKey, JSON.stringify(items), 'EX', 60); // Cache por 60s
  }

  return items;
}
