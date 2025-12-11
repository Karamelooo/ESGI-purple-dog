FROM node:22-alpine

WORKDIR /app

# Install system dependencies
# libc6-compat is often needed for process.dlopen (e.g. Next.js SWC, Prisma) on Alpine
RUN apk add --no-cache openssl libc6-compat

# Disable Next.js telemetry during build/dev
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies - layer caching
COPY package*.json ./
RUN npm install

# Generate Prisma client - separate layer to fast-track if only schema changes
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

CMD ["npm", "run", "dev"]
