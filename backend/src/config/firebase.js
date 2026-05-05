const admin = require("firebase-admin");

let serviceAccount;

// Try to load from environment variable first (for Vercel), then from file (for local)
if (process.env.FIREBASE_PRIVATE_KEY) {
  // Vercel/Production: Parse from environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle escaped newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || "",
  };
} else {
  // Local development: Read from file
  serviceAccount = require("../../serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    "hci-project-9fc9a.firebasestorage.app",
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    "https://hci-project-9fc9a.firebaseio.com",
});

const bucket = admin.storage().bucket();

console.log("✓ Firebase initialized");
console.log("✓ Bucket name:", bucket.name);
console.log("✓ Project ID:", serviceAccount.project_id);

module.exports = bucket;
