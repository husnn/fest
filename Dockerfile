FROM node:16-alpine

RUN mkdir -p /usr/src/app && \
  chown -R node:node /usr/src/app

WORKDIR /usr/src/app

USER node

COPY --chown=node:node . .

RUN chmod +x scripts/install_yarn.sh

RUN yarn install --inline-builds