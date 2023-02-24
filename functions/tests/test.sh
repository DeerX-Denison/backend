#! /bin/bash

export TESTER_PASSWORD="super-secret"
export TESTER_DEVICE_ID="device-id-1"
export TESTER_FCM_TOKEN="test-fcm-token"
export FIRESTORE_EMULATOR_HOST="localhost:8080"

source .env

./node_modules/.bin/ts-node ./tests/index.test.ts \
	--email $(echo $TESTERS_EMAIL | cut -d "," -f 1) \
	--password $TESTER_PASSWORD \
	--token $CREATE_TEST_USER_TOKEN \
	--device-id $TESTER_DEVICE_ID \
	--fcm-token $TESTER_FCM_TOKEN \
	--environment "development" \
	--debug

