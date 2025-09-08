# EPLQ Cloud Functions

## Setup

1. Install Firebase CLI:
```
npm i -g firebase-tools
```
2. Login:
```
firebase login
```
3. Install deps:
```
cd functions
npm install
```

## Local emulation
```
firebase emulators:start --only functions
```

## Deploy
From project root:
```
npm --prefix functions install
firebase deploy --only functions:queryNearby
```

The callable function name is `queryNearby`.
