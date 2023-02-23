#! /bin/bash

./node_modules/.bin/ts-node ./tests/index.ts \
	--email "deerx.test@gmail.com" \
	--password "welcomeToDeerX" \
	--token "superSecret" \
	--environment "development" \
	--debug

