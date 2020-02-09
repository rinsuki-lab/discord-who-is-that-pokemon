FROM node:13.8.0-alpine as base

WORKDIR /app

# ---

FROM base as builder

COPY package.json yarn.lock ./
RUN yarn install

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# ---

FROM base

RUN apk add --no-cache ffmpeg

COPY LICENSE package.json yarn.lock tsconfig.json ./
RUN yarn install --prod
COPY --from=builder /app/dist ./dist

ENV NODE_ENV production

CMD [ "node", "/app/dist/index.js" ]