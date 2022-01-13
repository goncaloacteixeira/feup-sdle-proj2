FROM node:16

WORKDIR /usr/app

COPY package*.json ./

COPY . .

EXPOSE 9000

RUN npm i

CMD ["npm", "start"]