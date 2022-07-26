# UBUNTU slim but not sveldt (385MB)
FROM node:18-bullseye-slim
LABEL maintainer="karl@oyamist.com"
RUN apt-get update && apt-get upgrade -y
ENV INSTALL="apt-get install -y"
RUN $INSTALL sudo
RUN $INSTALL lsb-release
RUN $INSTALL ripgrep

# User
RUN echo "unroot    ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN useradd unroot -s /bin/bash -m 
RUN usermod -aG sudo unroot

# Dev
RUN $INSTALL vim
RUN $INSTALL git
RUN git config --global pull.rebase true

# Audio tools
RUN $INSTALL opus-tools
RUN $INSTALL ffmpeg

# Application
USER unroot
WORKDIR /home/unroot
ENV GITSRC=https://github.com/sc-voice/scv-server
RUN git clone $GITSRC scv-server
WORKDIR /home/unroot/scv-server
RUN npm install
RUN git config branch.gh-pages.remote origin
RUN git config branch.gh-pages.merge refs/heads/gh-pages
RUN git status  #refresh git status

# Finalize
USER root
CMD [ "bash", "-c", "su -l unroot" ]
