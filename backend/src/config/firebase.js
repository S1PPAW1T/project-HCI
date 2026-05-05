const admin = require("firebase-admin");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (
  !serviceAccount.projectId ||
  !serviceAccount.privateKey ||
  !serviceAccount.clientEmail
) {
  console.error("❌ Firebase missing credentials. Check your .env file.");
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const bucket = admin.storage().bucket();

console.log("✓ Firebase initialized");
console.log("✓ Bucket name:", bucket.name);
console.log("✓ Project ID:", serviceAccount.projectId);

module.exports = bucket;
