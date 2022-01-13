FROM node:16

WORKDIR /usr/app

COPY package*.json ./

COPY . .

EXPOSE 3000

RUN npm i

CMD ["npm", "start"]