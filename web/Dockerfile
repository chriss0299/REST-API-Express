# Stage 1: build SPA Nuxt
FROM node:22-alpine AS builder
WORKDIR /app

ARG NUXT_PUBLIC_API_BASE=http://localhost:3000/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run generate

# Stage 2: serve con nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
