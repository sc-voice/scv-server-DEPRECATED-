#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`

APP=$DIR/..

set -e

echo "$SCRIPT: git subtree pull --prefix dist origin gh-pages"
git subtree pull --prefix dist origin gh-pages

json version < package.json \
  | sed -e 's/.*/export const Version = "&"/' \
  > $APP/src/version.mjs

echo "$SCRIPT: vite build"
vite build


