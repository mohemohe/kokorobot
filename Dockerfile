FROM node:8-alpine
MAINTAINER mohemohe <mohemohe@ghippos.net>

ENV PORT 8080
ENV MONGODB_URL mongodb://hubot-mongodb:27017/hubot

RUN apk add --no-cache tini docker

ADD . /kokorobot

EXPOSE 8080

WORKDIR /kokorobot
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./bin/hubot", "-a", "kokoro.io", "-n", "mohemohe-testbot"]
