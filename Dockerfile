FROM node:8-alpine
MAINTAINER mohemohe <mohemohe@ghippos.net>

ENV PORT 8080
ENV MONGODB_URL mongodb://hubot-mongodb:27017/hubot

RUN \
    set -xe; \
    apk add --no-cache tini docker

ADD . /kokorobot
WORKDIR /kokorobot

RUN \
    set -xe; \
    yarn

EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./bin/hubot", "-a", "kokoro.io", "-n", "mohemohe-kokorobot"]
