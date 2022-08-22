#!/bin/bash
DIR=`dirname $0`
VER=`node $DIR/version.cjs`
echo scv-server-$VER
DOCKER_BUILDKIT=1 docker build .\
  -t scv-server\
  -t scvoice/scv-server:$VER\
  -t scvoice/scv-server:latest
