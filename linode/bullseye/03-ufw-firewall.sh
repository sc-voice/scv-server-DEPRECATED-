#!/bin/bash
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`

set -e

echo $SCRIPT: BEGIN `date`

echo $SCRIPT: configure port 80 HTTP
if sudo ufw status numbered | grep -e " 80/"; then
  echo $SCRIPT: firewall rule conflict with existing rules
  exit 1
fi
sudo ufw allow proto tcp from any to any port 80

echo $SCRIPT: configure port 443 SSL
if sudo ufw status numbered | grep -e " 443/"; then
  echo $SCRIPT: firewall rule conflict with existing rules
  exit 1
fi
sudo ufw allow proto tcp from any to any port 443

echo $SCRIPT: configure port 8000 HTTP for NGINX verification
if sudo ufw status numbered | grep -e " 8000/"; then
  echo $SCRIPT: firewall rule conflict with existing rules
  exit 1
fi
sudo ufw allow proto tcp from any to any port 8000

echo $SCRIPT: Firewall status numbered
sudo ufw status verbose 

echo $SCRIPT: END `date`
