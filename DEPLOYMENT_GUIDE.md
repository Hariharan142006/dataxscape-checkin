# Deployment Guide: Firebase Hosting + Firestore

You have migrated the app to use **Firestore**.

## Prerequisites
1.  **Firebase Project**: Ensure you have a project created on [Firebase Console](https://console.firebase.google.com/).
2.  **Firestore Database**: Go to "Firestore Database" in the console and click "Create Database".

## Local Development
To run `npm run dev` with Firestore functionality:

1.  **Service Account**:
    *   Go to **Project Settings > Service accounts**.
    *   Click **Generate new private key**.
    *   Save the JSON file as `service-account.json` in the project root.
    *   **DO NOT COMMIT this file to Git.**

2.  **Environment Variable**:
    The code looks for `FIREBASE_SERVICE_ACCOUNT_KEY` or standard Google Auth.
    *   **Option A (.env.local)**:
        Convert the JSON content to a one-line string and save it in `.env.local`:
        `FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'`
    *   **Option B (Env Var)**:
        `$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"`

3.  **Seed Database (Create Users)**:
    Once you have credentials set up, run:
    ```bash
    node scripts/seed-firestore.js
    ```
    This creates:
    *   `admin` (pass: `admin123`)
    *   `hall_admin` (pass: `hall123`)

## Deployment
1.  **Set Project**:
    ```bash
    firebase use <YOUR_PROJECT_ID>
    ```

2.  **Deploy**:
    ```bash
    npm run deploy
    ```

## Rollback
If you need to revert to SQLite, you must revert the API routes and reinstall Prisma.
