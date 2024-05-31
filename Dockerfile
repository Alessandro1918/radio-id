FROM node:bullseye

WORKDIR /usr/app

COPY package*.json ./

# Install ffmpeg in the container:
RUN apt-get update
RUN apt-get install -y ffmpeg

RUN npm install

COPY . .

CMD [ "npm", "run", "compose_dev" ]
