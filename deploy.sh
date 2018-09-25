#!/usr/bin/env sh

# abort on errors
set -e

# lint all js
npm run lint:js

# lint all scss
npm run lint:sass

# run tests
npm run test

# build dist from scratch
gulp build-dist

# commit dist
git add dist
git commit -m "deploying dist"
git push origin master

# push to github pages subtree
git subtree push --prefix dist origin gh-pages
