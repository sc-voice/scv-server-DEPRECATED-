#!/bin/bash
DIR=`dirname $0`; 
APPDIR=`realpath $DIR/../..`
LOCALDIR=`realpath $APPDIR/local`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
echo -e "${SCRIPT}: BEGIN `date`"

set -e

echo -e "$SCRIPT: updating SSL certificate"
sudo /usr/bin/certbot renew --quiet 

echo -e "$SCRIPT: checking Dockerhub for scvoice/scv-server:latest..."
VERLOCAL=`sudo /usr/bin/docker image ls scvoice/scv-server:latest -q`
sudo /usr/bin/docker pull -q scvoice/scv-server:latest
VERDOCKERHUB=`sudo /usr/bin/docker image ls scvoice/scv-server:latest -q`
if [ "$VERLOCAL" == "$VERDOCKERHUB" ]; then
  echo -e "$SCRIPT: scvoice/scv-server:latest $VERLOCAL is latest"
else
  echo -e "$SCRIPT: scvoice/scv-server:latest updated $VERLOCAL => $VERDOCKERHUB"
fi

echo -e "${SCRIPT}: END `date`"
