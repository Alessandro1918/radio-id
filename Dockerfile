FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

# Install ffmpeg in the container:
RUN apk update
RUN apk add ffmpeg

RUN npm install

COPY . .

CMD [ "npm", "run", "compose_dev" ]
