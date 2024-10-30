FROM jfrog.sit.tbsgroup.co.id/docker-local/node-cypress:20.9.0

COPY . .
    
RUN npm install

ENV NO_COLOR=1
ENV DISPLAY=:99

ENTRYPOINT [ "sh", "-c", "Xvfb :99 & exec npx cypress-cloud \"$@\"" ]
