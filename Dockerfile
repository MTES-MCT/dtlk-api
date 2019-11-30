############################################
# Dockerfile for Datalake server (prod mode)
############################################

FROM keymetrics/pm2:12-slim as base

LABEL maintainer="Datalake Team" description="Docker image for Datalake server"

VOLUME /uploads
WORKDIR /dtlk
COPY ./package.json /dtlk/
RUN cd /dtlk && yarn install --verbose
ADD ./src /dtlk/src/
# ajout des fichiers de réferentiels dans l'application
ADD ./files /dtlk/files/
VOLUME /dtlk/pm2.json

FROM base as release

CMD ["pm2-runtime", "pm2.json", "--only", "api:intranet:alimentation"]
CMD ["pm2-runtime", "pm2.json", "--only", "api:intranet:diffusion"]
CMD ["pm2-runtime", "pm2.json", "--only", "queueui"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:createDatafile"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:addDatafileVersion"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:replaceDatafileVersion"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:sendMail"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:csvToMongo"]
CMD ["pm2-runtime", "pm2.json", "--only", "worker:uploadedFile"]

FROM base as audit
USER root
RUN apt-get update && apt-get -y install ca-certificates
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
ARG token
RUN /microscanner NTZiYmRjOTdlNTEw --continue-on-failure
run yarn audit --level critical

