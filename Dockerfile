#FROM node:20-buster
FROM cypress/included:12.17.4

WORKDIR /usr/src/app
COPY . .

RUN npm install

ENV NO_COLOR=1
ENV ELECTRON_EXTRA_LAUNCH_ARGS='--disable-gpu'
ENTRYPOINT [ "npx","cypress-cloud" ]
