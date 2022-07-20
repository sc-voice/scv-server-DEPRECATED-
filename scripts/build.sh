#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`

APP=$DIR/..

echo "$SCRIPT: pulling dist..."
git subtree pull --prefix dist origin gh-pages
RC=$?; if [ "$RC" != "0" ]; then
  echo "FAILED: git subtree pull --prefix dist origin gh-pages"
 exit
fi

echo "$SCRIPT: pulling dist..."
vite build
