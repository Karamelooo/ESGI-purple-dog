FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache openssl

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "dev"]
