# Use Node.js LTS Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps deterministically when possible
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci || npm install

# Copy TypeScript sources
COPY server.ts ./server.ts
COPY services ./services
COPY aws ./aws
COPY config ./config
COPY prisma ./prisma

# Build TS → dist
RUN npm run build

# Runtime
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/server.js"]
