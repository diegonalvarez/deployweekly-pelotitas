FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY src ./src/

EXPOSE 3099

# Dev: sync schema, seed if empty, watch mode
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed; npm run start:dev"]
