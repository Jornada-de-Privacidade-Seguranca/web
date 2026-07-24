FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm i

FROM base AS dev

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]