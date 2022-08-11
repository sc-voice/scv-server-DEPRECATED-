# syntax=docker/dockerfile:1
FROM node:18-bullseye-slim
LABEL maintainer="karl@oyamist.com"
RUN apt-get update && apt-get upgrade -y
SHELL [ "/bin/bash", "-c" ]
ENV INSTALL="apt-get --no-install-recommends install -y "

RUN <<TOOLS
  $INSTALL sudo
  $INSTALL procps   # ps commmand
  $INSTALL ripgrep  # faster than grep
  $INSTALL git
  $INSTALL apache2-utils  # rotatelogs
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
WORKDIR /home/unroot/scv-server
COPY --link --chown=unroot index* LICENSE package* vite* .
COPY --link --chown=unroot dist dist
COPY --link --chown=unroot public public
COPY --link --chown=unroot scripts scripts
COPY --link --chown=unroot src src
COPY --link --chown=unroot styles styles
COPY --link --chown=unroot words words
RUN <<SCV_SERVER
  #git clone https://github.com/sc-voice/scv-server scv-server
  mkdir -p /home/unroot/scv-server/local
  cd scv-server
  npm install --production
  echo "cd scv-server" >> ~/.bashrc
SCV_SERVER

# Start application server
USER unroot
ENV START=start:8080
EXPOSE 8080
CMD cd /home/unroot/scv-server; npm run $START
