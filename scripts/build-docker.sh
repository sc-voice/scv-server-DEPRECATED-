#!/bin/bash
VER=`json version < package.json`
echo scv-server-$VER
DOCKER_BUILDKIT=1 docker build .\
  -t scv\
  -t scvoice/scv-server:$VER\
  -t scvoice/scv-server:latest
