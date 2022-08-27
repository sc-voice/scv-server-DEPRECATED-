#!/bin/bash
DIR=`dirname $0`; 
APPDIR=`realpath $DIR/../..`
LOCALDIR=`realpath $APPDIR/local`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
echo -e "${SCRIPT}: BEGIN `date`"

set -e

export EDITOR=ed
export VISUAL=ed
if [ crontab -l | grep scv-cron ]; then
  echo -e "$SCRIPT: scv-cron.sh job already configured"
  echo -e "${SCRIPT}: END `date`"
  exit
fi

echo -e "$SCRIPT: adding scv-cron.sh to cron "
cat <<ED_HEREDOC | crontab -e
G
a
0 4 * * * /home/unroot/scv-server/linode/bullsyes/scv-cron.sh
.
w
q
ED_HEREDOC

echo -e "${SCRIPT}: END `date`"
