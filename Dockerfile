FROM node:16-alpine

RUN mkdir -p /usr/src/app && \
  chown -R node:node /usr/src/app

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN apk add --update --no-cache \
    build-base \
    bash \
    curl \
    make \
    nodejs \
    python3 \
    yarn \
  && npm install --global node-gyp

RUN yarn install --inline-builds
