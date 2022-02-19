# DeerX Backend

# Package Script

```
# run firebase emulators
yarn dev

# build production-ready backend
yarn build

# run test (assuming emulators already running)
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Encrypt secrets files -
yarn encrypt

# Decrypt secrets files
yarn decrypt
```

# CI/CD

On push to "production", build and deploy to production firebase project

On push to "staging", build and deploy to staging firebase project

# Setup Environment Variables

- navigate to ./example.env
- fill out environment variables given by admin
- IMPORTANT: rename "example.env" to ".env" before commiting - git only ignores ".env" file, not "example.env"

# Get Started

```
# This project requires firebase emulators
sudo yarn global add firebase-tools

# Install NodeJS dependencies
yarn install

# Setup secrets config files
yarn decrypt

# Switch to firebase development environemnt
firebase use default

# Run development suites
yarn dev
```
