# Use Node.js LTS Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (postinstall will run prisma generate)
RUN npm install --omit=dev

# Copy Prisma schema
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Copy application code
COPY server.js ./

# Expose port
EXPOSE 5000

# Start server
ENV NODE_ENV=production
CMD ["node", "server.js"]
