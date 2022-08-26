#!/bin/bash
DIR=`dirname $0`; 
APPDIR=`realpath $DIR/../..`
LOCALDIR=`realpath $APPDIR/local`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
echo -e "${SCRIPT}: BEGIN `date`"

set -e

DOCKER_VOLUME=nodejs_scv-local
echo -e "$SCRIPT: linking to $DOCKER_VOLUME as ./local" 
ln -s -f /var/lib/docker/volumes/$DOCKER_VOLUME/_data local

echo -e "$SCRIPT: sudo docker compose up -d"
sudo docker compose up -d

echo -e "$SCRIPT: testing localhost:8080 (scv-server docker container)"
curl http://localhost:8080/scv/play/segment/thig1.1/en/sujato/thig1.1%3A1.1/Amy

echo -e "$SCRIPT: testing localhost (nginx reverse proxy => scv-server docker container)"
curl http://localhost/scv/play/segment/thig1.1/en/sujato/thig1.1%3A1.1/Amy

echo -e "${SCRIPT}: END `date`"
