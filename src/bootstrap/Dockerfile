FROM node:latest

WORKDIR /usr/app

COPY package*.json ./

COPY . .

RUN npm i

CMD ["npm", "start"]