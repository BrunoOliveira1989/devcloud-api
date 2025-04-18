import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '../config/dynamodb';
import { getRedisClient } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const COMMENT_TABLE = process.env.DYNAMO_COMMENTS_TABLE!;
const REDIS_ENABLED = process.env.ENABLE_REDIS === 'true'; // Verifica se o Redis está habilitado

export async function addCommentService(imageId: string, content: string, user: string) {
  const id = uuidv4();
  const timestamp = new Date().toISOString();

  // Salvar o comentário no DynamoDB
  await dynamoClient.send(new PutItemCommand({
    TableName: COMMENT_TABLE,
    Item: {
      id: { S: id },
      imageId: { S: imageId },
      content: { S: content },
      user: { S: user },
      createdAt: { S: timestamp },
    },
  }));

  // Invalida o cache de comentários relacionados à imagem se o Redis estiver habilitado
  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    await redis.del(`comments:list:${imageId}`);
  }

  return { id, content, user, createdAt: timestamp };
}

export async function listCommentsService(imageId: string) {
  const cacheKey = `comments:list:${imageId}`;

  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    // Verifica se o cache existe
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // Usa Scan ao invés de Query
  const result = await dynamoClient.send(new ScanCommand({
    TableName: COMMENT_TABLE,
    FilterExpression: 'imageId = :imageId',
    ExpressionAttributeValues: {
      ':imageId': { S: imageId },
    },
  }));

  const items = result.Items?.map((item) => ({
    id: item.id.S,
    content: item.content.S,
    user: item.user.S,
    createdAt: item.createdAt.S,
  })) || [];

  // Salva no cache se o Redis estiver habilitado
  if (REDIS_ENABLED) {
    const redis = getRedisClient();
    await redis.set(cacheKey, JSON.stringify(items), 'EX', 60); // Cache por 60s
  }

  return items;
}
