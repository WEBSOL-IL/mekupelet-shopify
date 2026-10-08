FROM node:22-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* .npmrc ./

# tsx (worker runtime) and prisma are regular dependencies, so --omit=dev is safe.
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npx prisma generate && npm run build

CMD ["npm", "run", "docker-start"]
