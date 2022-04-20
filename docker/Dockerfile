FROM node:17.4-alpine

WORKDIR /app

ENV NODE_ENV develop

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY tsconfig.json tsconfig.build.json .eslintrc.js .prettierrc nest-cli.json ./

COPY src/ ./

CMD ["npm", "run", "start:dev"]
