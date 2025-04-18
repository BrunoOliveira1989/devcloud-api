import Redis from 'ioredis';
import dotenv from 'dotenv';  // Importando o dotenv para carregar variáveis de ambiente de forma segura

// Carregar as variáveis de ambiente a partir do arquivo .env
// Isso é essencial para não expor dados sensíveis no código-fonte, como as credenciais da AWS.
dotenv.config();

let redisClient: Redis | null = null;

const REDIS_ENABLED = process.env.ENABLE_REDIS === 'true';
const REDIS_COMMAND_TIMEOUT = 10000; // 10 segundos
const MAX_REDIS_ATTEMPS = 5; // Número máximo de tentativas de reconexão
const REDIS_BACKOFF_RETRY = 2000; // em milissegundos

export const connectRedis = () => {
  if (!REDIS_ENABLED) {
    console.log('⚠️ Redis está desabilitado via configuração.');
    return;
  }

  if (!redisClient) {
    console.log('🔗 Tentando conectar no Redis...');

    redisClient = new Redis({
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: {}, // Habilita TLS para conexão segura
      commandTimeout: REDIS_COMMAND_TIMEOUT,
      connectTimeout: 10000,
      retryStrategy: (times: number) => {
        if (times > MAX_REDIS_ATTEMPS) {
          console.error('❌ Máximo de tentativas de conexão atingido.');
          return null;
        }
        console.log(`🔄 Tentando reconectar... Tentativa ${times}`);
        return REDIS_BACKOFF_RETRY;
      },
    });

    // Eventos de log
    redisClient.on('connect', () => console.log('✅ Redis conectado com sucesso'));
    redisClient.on('error', (err) => console.error('❌ Erro no Redis:', err));
    redisClient.on('ready', () => console.log('✅ Redis pronto para uso'));
    redisClient.on('close', () => console.log('🔴 Redis conexão fechada'));
    redisClient.on('reconnecting', () => console.log('🔄 Reconectando ao Redis...'));
    redisClient.on('end', () => console.log('🔚 Conexão com Redis foi encerrada'));
  }
};

export const getRedisClient = () => {
  if (!REDIS_ENABLED) {
    throw new Error('❌ Redis está desabilitado, mas você tentou acessá-lo.');
  }

  return redisClient!;
};
