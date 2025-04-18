# Etapa 1 – build (usando uma imagem leve com Node e TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências primeiro para usar o cache do Docker
COPY package*.json tsconfig.json ./
#COPY .env .env
COPY ./src ./src

# Instala dependências e compila o projeto
RUN npm install
RUN npm run build

# Etapa 2 – runtime (imagem final só com os arquivos compilados)
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos compilados e dependências
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
#COPY --from=builder /app/.env .env

# Define a variável de ambiente
ENV NODE_ENV=production

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/index.js"]