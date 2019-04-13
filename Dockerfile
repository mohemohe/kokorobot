FROM node:8-alpine
MAINTAINER mohemohe <mohemohe@ghippos.net>

ENV S6_KEEP_ENV 1
ENV PORT 8080
ENV MONGODB_URL mongodb://hubot-mongodb:27017/hubot
EXPOSE 8080

RUN \
    set -xe; \
    wget -O - https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz | tar xzf - -C /; \
    apk add --no-cache docker

ADD . /kokorobot
WORKDIR /kokorobot
VOLUME /kokorobot/node_modules

RUN \
    set -xe; \
    cp -rf docker/root/* /

ENTRYPOINT ["/init"]
