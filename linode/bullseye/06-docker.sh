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

URLPATH=/scv/play/segment/thig1.1/en/sujato/thig1.1%3A1.1/Amy
echo -e "$SCRIPT: testing localhost:8080..."
if curl http://localhost:8080/$URLPATH; then
  echo
  echo -e "$SCRIPT: scv-server docker container is running (OK)"
else 
  echo -e "$SCRIPT: scv-server docker container is not running (ERROR)"
  exit 1
fi

echo -e "$SCRIPT: testing localhost (nginx reverse proxy => scv-server docker container)"
if curl http://localhost/$URLPATH; then
  echo
  echo -e "$SCRIPT: reverse proxy => scv-server docker container (OK)"
else
  echo -e "$SCRIPT: nginx reverse proxy => scv-server docker container (ERROR)"
  exit 1
fi

echo -e "${SCRIPT}: END `date`"
