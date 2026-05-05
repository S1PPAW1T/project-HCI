# Vercel Deployment Setup Guide

## Required Environment Variables

Set these in Vercel Dashboard: Settings → Environment Variables

### Database

- **MONGO_URI**: MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/dbname
  ```

### OpenAI API

- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys

### Firebase Admin SDK

Get these from Firebase Console → Project Settings → Service Account:

- **FIREBASE_PROJECT_ID**: Project ID
- **FIREBASE_PRIVATE_KEY_ID**: Private Key ID
- **FIREBASE_PRIVATE_KEY**: Private Key (copy as-is, Vercel handles newlines)
- **FIREBASE_CLIENT_EMAIL**: Client email
- **FIREBASE_CLIENT_ID**: Client ID (optional)
- **FIREBASE_CLIENT_X509_CERT_URL**: Certificate URL (optional)
- **FIREBASE_STORAGE_BUCKET**: Storage bucket name (e.g., `hci-project-9fc9a.firebasestorage.app`)
- **FIREBASE_DATABASE_URL**: Realtime database URL (optional)

### How to Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ (Settings) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. A JSON file downloads - copy values from it to environment variables

⚠️ **Important**: The `FIREBASE_PRIVATE_KEY` contains newline characters (`\n`). When pasting into Vercel:

- Copy the entire value including quotes
- Vercel automatically handles the newline escaping
- Do NOT manually escape newlines

## Deployment Steps

1. Push code to GitHub (exclude `serviceAccountKey.json`)
2. Connect GitHub repo to Vercel
3. Select "Backend" folder as root directory
4. Add all environment variables in Vercel dashboard
5. Deploy

## Local Testing

```bash
cd backend
npm install
npm run dev
```

## Important Notes

- **File Storage**: All files are uploaded to Firebase Storage (serverless-compatible)
- **Speech Recognition**: Using OpenAI Whisper API only
- **No Local File Storage**: `/uploads` folder is ignored on Vercel
- **Serverless Compatible**: Works with Vercel's serverless functions
- **Cold Start**: First request may take 5-10 seconds due to MongoDB connection

## Troubleshooting

### Firebase Authentication Fails

- Check all Firebase environment variables are set correctly
- Verify `FIREBASE_PRIVATE_KEY` is pasted completely with all characters
- Check project ID matches in Firebase Console

### MongoDB Connection Fails

- Verify `MONGO_URI` is correct
- Check MongoDB IP whitelist includes Vercel's IP range (use `0.0.0.0/0` for testing)

### Audio Transcription Fails

- Verify `OPENAI_API_KEY` is valid and has sufficient credits
- Check file format is supported (WAV, MP3, etc.)

### View Logs

```bash
vercel logs <project-name>
```

## Environment Variables Summary

```env
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=hci-project-9fc9a
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_CLIENT_ID=...
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
FIREBASE_STORAGE_BUCKET=hci-project-9fc9a.firebasestorage.app
FIREBASE_DATABASE_URL=https://hci-project-9fc9a.firebaseio.com
```
