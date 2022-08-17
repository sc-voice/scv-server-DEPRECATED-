#!/bin/bash

echo -e "DAEMON\t: creating scv-server systemctl daemon"

SCRIPT_DIR=`realpath \`dirname $0\``
APP_DIR=$SCRIPT_DIR/..
LOCAL_DIR=$APP_DIR/local

mkdir -p $LOCAL_DIR
cat <<- HEREDOC > $LOCAL_DIR/scv-server.service
[Unit]
Description=SuttaCentral Voice Assistant
After=network.target

[Service]
User=`whoami`
Environment=
WorkingDirectory=`realpath $APP_DIR`
ExecStart=$SCRIPT_DIR/scv-server-start.sh
ExecStop=$SCRIPT_DIR/scv-server-stop.sh

[Install]
WantedBy=multi-user.target
HEREDOC
# END scv-server.service

SERVICE_FILE=/etc/systemd/system/scv-server.service 
if [ -e $SERVICE_FILE ]; then
    echo -e "DAEMON\t: ${SERVICE_FILE} has already been installed"
else
    echo -e "DAEMON\t: installing ${SERVICE_FILE} "
    sudo cp local/scv-server.service ${SERVICE_FILE}
fi

sudo systemctl daemon-reload
sudo systemctl enable scv-server
sudo systemctl start scv-server
sudo systemctl status scv-server
