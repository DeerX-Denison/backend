#! /bin/bash

export TESTER_PASSWORD="super-secret"
export TESTER_DEVICE_ID="device-id-1"
export TESTER_FCM_TOKEN="test-fcm-token"
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export LISTING_IMAGES_URL="https://i.ibb.co/Y26TN8k/denison-icon-red.jpg,https://i.ibb.co/JKS8DzC/default-profile-photo.jpg,https://i.ibb.co/M66vK2N/deerx-invalid-image-content.jpg"
export LISTING_NAME="test listing name"
export LISTING_PRICE="123"
export LISTING_CATEGORY="ELECTRONIC,INSTRUMENT"
export LISTING_CONDITION="BRAND NEW"
export LISTING_DESCRIPTION="test listing description"
export LISTING_STATUS="posted"


source .env

./node_modules/.bin/ts-node ./tests/index.test.ts \
	--email $(echo $TESTERS_EMAIL | cut -d "," -f 1) \
	--password "$TESTER_PASSWORD" \
	--create-test-user-token "$CREATE_TEST_USER_TOKEN" \
	--device-id "$TESTER_DEVICE_ID" \
	--fcm-token "$TESTER_FCM_TOKEN" \
	--images "$LISTING_IMAGES_URL" \
	--name "$LISTING_NAME" \
	--price "$LISTING_PRICE" \
	--category "$LISTING_CATEGORY" \
	--condition "$LISTING_CONDITION" \
	--description "$LISTING_DESCRIPTION" \
	--status "$LISTING_STATUS" \
	--environment "development" \
	--debug

