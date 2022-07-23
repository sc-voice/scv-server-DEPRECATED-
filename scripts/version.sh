#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
APP=$DIR/..
set -e

npm version minor

json version < package.json \
  | sed -e 's/.*/<template>&<\/template>/' \
  | tee $APP/src/components/Version.vue
