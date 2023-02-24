#! /bin/bash

source .env

./node_modules/.bin/ts-node ./tests/index.test.ts \
	--email "test@gmail.com" \
	--password "super-secret" \
	--token $CREATE_TEST_USER_TOKEN \
	--device-id "device-id-1" \
	--fcm-token "test-fcm-token" \
	--environment "development" \
	--debug

