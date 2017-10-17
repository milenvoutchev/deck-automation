#!/bin/bash
yarn prod:build
(cd build && ln -s ../server/public public)
(cd build && ln -s ../server/views views)
