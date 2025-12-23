# Use Node.js LTS Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps deterministically when possible
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy app source (JS + supporting dirs)
COPY server.js ./
COPY services ./services
COPY aws ./aws
COPY config ./config
COPY prisma ./prisma

# Runtime
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
