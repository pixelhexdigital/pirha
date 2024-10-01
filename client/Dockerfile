FROM node:current-alpine3.19

WORKDIR /app

COPY package.json .

RUN yarn

RUN yarn add global vite

COPY . .

EXPOSE 5173

CMD [ "serve", "-s", "dist" ]