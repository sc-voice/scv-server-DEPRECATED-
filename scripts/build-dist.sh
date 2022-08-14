#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
APP=$DIR/..
set -e

#echo "$SCRIPT: git subtree pull --prefix dist origin gh-pages"
#git subtree pull --prefix dist origin gh-pages

VERSION=`node scripts/version.cjs`
echo "<template>v$VERSION</template>" | tee $APP/src/components/Version.vue

echo "$SCRIPT: vite build"
vite build

echo $VERSION > $APP/dist/version


