# syntax=docker/dockerfile:1
FROM node:18-bullseye-slim
LABEL maintainer="karl@oyamist.com"
RUN apt-get update && apt-get upgrade -y
ENV INSTALL="apt-get --no-install-recommends install -y "

RUN <<TOOLS
  apt-get --no-install-recommends install -y sudo
  $INSTALL sudo
  $INSTALL ripgrep
  $INSTALL git
  git config --global pull.rebase true 
  apt-get install -y --reinstall ca-certificates
TOOLS

RUN <<UNROOT
  echo "unroot    ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
  useradd unroot -s /bin/bash -m
  usermod -aG sudo unroot
UNROOT

RUN <<AUDIO
  $INSTALL opus-tools
  $INSTALL ffmpeg
AUDIO

USER unroot
WORKDIR /home/unroot
EXPOSE 8080
RUN <<SCV_SERVER
  git clone https://github.com/sc-voice/scv-server scv-server
  mkdir -p /home/unroot/scv-server/local
  cd scv-server
  npm install
SCV_SERVER

# Finalize
USER root
CMD [ "bash", "-c", "su -l unroot; cd scv-server" ]
