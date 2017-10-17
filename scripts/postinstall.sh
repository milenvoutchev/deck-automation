#!/bin/bash

# add babel to .bin folder (not added by heroku, maybe as npm install hooks are not run or whatever)
(cd node_modules/.bin && ln -s ../babel-cli/bin/babel.js babel)
yarn prod:build

# link to "static" folders from build (missing, as babel creates only .js files)
(cd build && ln -s ../server/public public)
(cd build && ln -s ../server/views views)
