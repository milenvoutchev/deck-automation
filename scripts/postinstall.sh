#!/bin/bash

# add babel to .bin folder (not added by heroku, maybe as npm install hooks are not run or whatever)
npm run prod:build

# link to "static" folders from build (missing, as babel creates only .js files)
cd build
rm -rf views && ln -s ../server/views views
cd ..
