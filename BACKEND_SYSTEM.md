# Backend System Documentation

## Overview

This backend system manages a two-step user flow:

1. **Login**: Collect user info (name, age, consent) and create a MongoDB record
2. **Audio Upload**: Upload audio file to Firebase Storage and link it to the user record

## Key Features

- ✅ Only the **first audio recording** is saved (subsequent uploads are rejected)
- ✅ Name and age are linked with the audio file
- ✅ Audio stored in Firebase Storage with public URL
- ✅ Metadata stored in MongoDB with reference to Firebase URL

---

## API Endpoints

### 1. POST /api/user/login

**Purpose**: Create a new user session and MongoDB record

**Request Body**:

```json
{
  "name": "John Doe",
  "age": 25,
  "consent": true
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 25
  }
}
```

**Error Responses**:

- `400`: Missing required fields (name, age, consent)
- `500`: Database error

---

### 2. POST /api/audio/upload

**Purpose**: Upload audio file and update user record

**Request**:

- Method: `POST`
- Content-Type: `multipart/form-data`
- Fields:
  - `id` (string): MongoDB record ID from login
  - `audio` (file): Audio file (.wav, .mp3, etc.)

**cURL Example**:

```bash
curl -X POST http://localhost:5000/api/audio/upload \
  -F "id=507f1f77bcf86cd799439011" \
  -F "audio=@recording.wav"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Audio uploaded successfully",
  "data": {
    "name": "John Doe",
    "age": 25,
    "audioUrl": "https://storage.googleapis.com/hci-project-9fc9a.appspot.com/1704067200000.wav"
  }
}
```

**Error Responses**:

- `400`: No file uploaded, missing ID, or audio already uploaded
- `404`: Audio record not found
- `500`: Upload or database error

---

## Database Schema (MongoDB)

### Audio Collection

```javascript
{
  _id: ObjectId,
  name: String,           // Required
  age: Number,           // Required
  audioUrl: String,      // Optional (null until first upload)
  createdAt: Date        // Auto-generated
}
```

**Constraints**:

- `audioUrl` can only be set once
- Attempting to upload again returns a 400 error

---

## Firebase Storage

- **Bucket**: `hci-project-9fc9a.appspot.com`
- **File Naming**: Timestamp + original extension (e.g., `1704067200000.wav`)
- **Permissions**: All uploaded files are made public for easy retrieval
- **URL Format**: `https://storage.googleapis.com/{bucket}/{fileName}`

---

## Frontend Integration

### Step 1: Login

1. User submits name, age, and consent
2. Frontend sends POST to `/api/user/login`
3. Backend creates MongoDB record and returns `id`
4. Frontend stores `id` in localStorage as `audioSessionId`

**Example**:

```javascript
const response = await fetch("http://localhost:5000/api/user/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, age, consent }),
});

const data = await response.json();
localStorage.setItem("audioSessionId", data.data.id);
```

### Step 2: Audio Upload

1. User records audio in Task 1 page
2. Frontend gets `id` from localStorage
3. Frontend sends multipart form to `/api/audio/upload`
4. Backend checks if audio already exists, uploads to Firebase, updates MongoDB

**Example**:

```javascript
const formData = new FormData();
formData.append("id", localStorage.getItem("audioSessionId"));
formData.append("audio", audioBlob, "recording.wav");

const response = await fetch("http://localhost:5000/api/audio/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data.data.audioUrl); // Firebase URL
```

---

## Environment Variables

**Required** in `.env`:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
OPENAI_API_KEY=sk-...
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Error Handling

All endpoints use centralized error middleware that returns:

```json
{
  "message": "Error description",
  "status": 400
}
```

---

## Security Considerations

- ✅ Firebase Storage files are authenticated
- ✅ MongoDB uses connection string authentication
- ✅ Input validation on all endpoints
- ✅ CORS enabled for frontend requests
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add authentication tokens for production

---

## Testing the System

### Manual Testing

1. **Start backend**:

   ```bash
   npm start
   ```

2. **Test login**:

   ```bash
   curl -X POST http://localhost:5000/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","age":25,"consent":true}'
   ```

3. **Test upload** (save the ID from step 2):

   ```bash
   curl -X POST http://localhost:5000/api/audio/upload \
     -F "id=<RECORD_ID>" \
     -F "audio=@test-audio.wav"
   ```

4. **Test duplicate upload** (should fail):

   ```bash
   curl -X POST http://localhost:5000/api/audio/upload \
     -F "id=<RECORD_ID>" \
     -F "audio=@test-audio.wav"

   # Expected: 400 error "Only the first recording is saved"
   ```

---

## Troubleshooting

### Issue: "MongoDB connected" not showing

- Check `.env` file has valid `MONGO_URI`
- Ensure MongoDB cluster is accessible

### Issue: Upload fails with 404

- Verify the `id` from login endpoint is correct
- Check MongoDB has the record

### Issue: Firebase upload fails

- Check `serviceAccountKey.json` exists
- Verify Firebase credentials are valid
- Check bucket name matches

### Issue: CORS error on frontend

- Backend CORS middleware should allow all origins
- Check `http://localhost:5000` is accessible from frontend
