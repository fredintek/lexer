# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN cp -r src/email/templates dist/email/templates

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# EXPOSE the port NestJS is listening on
EXPOSE 11111

CMD ["node", "dist/main"]