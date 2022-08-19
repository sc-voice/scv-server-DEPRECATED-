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

# Container user node UID:1000
# Container user unroot UID:1001
# Linode host user unroot UID:1000
# +---------------- WARNING ----------------------+
# | ONLY HOST UID 1000 OR 1001 CAN HOST CONTAINER |
# +-----------------------------------------------+
RUN <<UNROOT
  echo "node    ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
  echo "unroot    ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
  useradd unroot -s /bin/bash -m
  usermod -aG sudo unroot
UNROOT

RUN <<AUDIO
  $INSTALL opus-tools
  $INSTALL ffmpeg
AUDIO

ENV USER=unroot
USER $USER
ENV APPDIR=/home/$USER/scv-server/
WORKDIR $APPDIR
COPY --link --chown=$USER package* $APPDIR
RUN <<SCV_SERVER
  mkdir -p $APPDIR/local
  cd $APPDIR
  npm install --production
  echo "cd $APPDIR" >> ~/.bashrc
SCV_SERVER
COPY --link --chown=$USER . $APPDIR

# Start application server
ENV START=start
EXPOSE 80
CMD npm run $START
