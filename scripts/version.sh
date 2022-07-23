#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
APP=$DIR/..
set -e

npm version minor

VERSION=` json version < package.json`

echo "<template>$VERSION</template>" | tee $APP/src/components/Version.vue
