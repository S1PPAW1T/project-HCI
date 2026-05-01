const admin = require("firebase-admin");

const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "hci-project-9fc9a.appspot.com",
  databaseURL: "https://hci-project-9fc9a.firebaseio.com",
});

const bucket = admin.storage().bucket();

console.log("✓ Firebase initialized");
console.log("✓ Bucket name:", bucket.name);
console.log("✓ Project ID:", serviceAccount.project_id);

module.exports = bucket;
