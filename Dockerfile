FROM node:bullseye

WORKDIR /usr/app

COPY package*.json ./

# Install ffmpeg in the container:
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]
