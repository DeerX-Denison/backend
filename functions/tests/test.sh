#! /bin/bash

export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"

source .env

./node_modules/.bin/ts-node ./tests/index.test.ts

