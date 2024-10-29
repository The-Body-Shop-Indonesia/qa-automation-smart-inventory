FROM node:16-buster

WORKDIR /usr/src/app
COPY . .

RUN npm install

ENV NO_COLOR=1

ENTRYPOINT [ "npx","cypress-cloud" ]
