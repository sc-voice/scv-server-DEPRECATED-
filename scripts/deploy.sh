#!/usr/bin/env sh
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`

APP=$DIR/..

echo "$SCRIPT: pulling dist..."
git subtree pull --prefix dist origin gh-pages

# build
npm run build

echo "$SCRIPT: adding changed files"
git add .
git commit -m "$SCRIPT: committing dist"

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

pwd
echo "$SCRIPT: pushing dist..."
git subtree push --prefix dist origin gh-pages
