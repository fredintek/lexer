# Stage 1: Install & Build
FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

ARG NEXT_PUBLIC_LOGO_DEV_PK
ENV NEXT_PUBLIC_LOGO_DEV_PK=$NEXT_PUBLIC_LOGO_DEV_PK

COPY package*.json ./
RUN npm install
COPY . .

# Run the build (Next.js bakes the ARGs into the static files here)
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["npm", "start"]