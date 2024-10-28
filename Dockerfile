FROM cypress/included:13.10.0

WORKDIR /e2e
COPY . .

RUN npm install cypress-cloud cypress

ENV NO_COLOR=1

ENTRYPOINT [ "cypress" ]
