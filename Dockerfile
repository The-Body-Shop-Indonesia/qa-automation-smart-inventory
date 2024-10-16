FROM cypress/included:13.10.0

WORKDIR /e2e
COPY . .


ENTRYPOINT [ "cypress" ]