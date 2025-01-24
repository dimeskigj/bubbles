FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g ts-node typescript

EXPOSE 8000

ENTRYPOINT ["npm", "run", "serve"]