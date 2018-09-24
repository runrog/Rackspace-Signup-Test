#!/usr/bin/env sh

# abort on errors
set -e

# lint js first
npm run lint

# build dist from scratch
gulp build-dist

# commit dist
git add dist
git commit -m "deploying dist"
git push origin master

# push to subtree
git subtree push --prefix dist origin gh-pages
