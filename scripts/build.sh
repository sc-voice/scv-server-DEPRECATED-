#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`

APP=$DIR/..

set -e

echo "$SCRIPT: git subtree pull --prefix dist origin gh-pages"
git subtree pull --prefix dist origin gh-pages

echo "$SCRIPT: vite build"
vite build


