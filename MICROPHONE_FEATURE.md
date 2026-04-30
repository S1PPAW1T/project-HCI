# Microphone Recording Implementation - Complete

## Frontend Features Implemented (Test Page)

### 1. **Recording Controls**

- **Start/Stop Button**:
  - Gray by default
  - Turns **light red** (`bg-red-300`) while recording
  - Click to start new recording OR stop current recording
  - Disabled during upload

### 2. **Recording Behavior**

- Uses browser's **MediaRecorder API** for native audio capture
- **Re-recording**: Click button again to clear previous recording and start new one
- Clears audio chunks before each new recording
- Stops stream and recorder when done

### 3. **Audio Upload**

- **Trigger**: Click "Next" button on Page 1 of Task 1
- **Process**:
  - Stops recording if still active
  - Creates Blob from recorded audio chunks
  - Sends via multipart/form-data to backend
  - Shows "⏳ Uploading audio..." status
  - Displays result on success or error message on failure

### 4. **Status Indicators**

- **Recording**: 🔴 Red box showing "Recording in progress..."
- **Uploaded**: ✓ Green box showing "Audio uploaded successfully!"
- **Error**: ✗ Red box showing error message
- **Uploading**: ⏳ Blue box showing upload progress

### 5. **Session Protection**

- Checks `localStorage.audioSessionId` on mount
- Redirects to login if not found
- Only allows upload within valid session

### 6. **Button States**

- **Next Button**:
  - Disabled while uploading
  - Disabled while recording on Task 1, Page 1
  - Shows "Uploading..." text during upload
  - Auto-proceeds after 1.5 seconds on successful upload

---

## Backend API (Node.js + Express)

### Endpoint: `POST /api/audio/upload`

**Request** (multipart/form-data):

```
Content-Type: multipart/form-data
Body:
  - id: MongoDB record ID
  - audio: Audio file (Blob/WAV)
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Audio uploaded successfully",
  "data": {
    "name": "John Doe",
    "age": 25,
    "audioUrl": "https://storage.googleapis.com/..."
  }
}
```

**Error Response** (400/404/500):

```json
{
  "message": "Audio already uploaded. Only the first recording is saved.",
  "status": 400
}
```

---

## Backend Logic

### User Controller (`/api/user/login`)

1. Receives: `{ name, age, consent }`
2. Creates MongoDB record with name and age
3. Returns: `{ id, name, age }`
4. Frontend stores ID in `localStorage.audioSessionId`

### Audio Controller (`/api/audio/upload`)

1. Receives: Record ID + audio file
2. **Validates**:
   - Record exists in MongoDB
   - `audioUrl` is null (first upload only)
3. **If valid**:
   - Uploads audio to Firebase Storage
   - Generates public URL
   - Updates MongoDB record with audioUrl
   - Returns user data with URL
4. **If invalid**:
   - Returns 400 error "Audio already uploaded"
   - Does NOT overwrite existing recording

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│ User records audio in Test Page (Page 1, Task 1)    │
│ - MediaRecorder API captures audio                  │
│ - Re-recording overwrites audio chunks              │
└────────────────────────┬────────────────────────────┘
                         │
                         ├─ User clicks "Next"
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│ Frontend uploads audio                              │
│ - Creates Blob from audio chunks                    │
│ - Gets record ID from localStorage                  │
│ - POSTs multipart/form-data to backend              │
│ - Shows "Uploading..." status                       │
└────────────────────────┬────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│ Backend processes upload                            │
│ - Verifies record exists                            │
│ - Checks audioUrl is null (first upload)            │
│ - Uploads to Firebase Storage                       │
│ - Updates MongoDB record                            │
│ - Returns success with user data                    │
└────────────────────────┬────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│ Frontend shows result                               │
│ - Displays success message                          │
│ - Auto-proceeds to next page after 1.5s             │
│ - Clears recording for next task                    │
└─────────────────────────────────────────────────────┘
```

---

## Key Features Implemented

✅ **Real Audio Capture**: Uses native MediaRecorder API
✅ **Re-recording**: Clears and overwrites previous audio
✅ **Single Upload Constraint**: Backend rejects duplicate uploads
✅ **Status Feedback**: Shows recording, uploading, and error states
✅ **Session Management**: Stores ID in localStorage
✅ **Error Handling**: Gracefully handles microphone errors and upload failures
✅ **Automatic Navigation**: Proceeds to next page after successful upload
✅ **Button State Management**: Proper enable/disable during operations
✅ **Audio File Format**: Recorded as WAV format for compatibility

---

## Testing Checklist

- [ ] Microphone button is gray initially
- [ ] Clicking microphone starts recording (button turns red)
- [ ] Clicking again stops recording (button returns to gray)
- [ ] Status shows "🔴 Recording in progress..."
- [ ] Clicking again after stopping starts new recording (clears old)
- [ ] Clicking "Next" after recording uploads audio
- [ ] Status shows "⏳ Uploading audio..."
- [ ] On success, status shows "✓ Audio uploaded successfully!"
- [ ] Page auto-advances after 1.5 seconds
- [ ] Recording for Task 2+ works similarly
- [ ] Re-recording on Task 1 is rejected by backend with error message
- [ ] Microphone permission denial shows error message
- [ ] No recording shows error when clicking Next

---

## Technical Stack

**Frontend**:

- React/Next.js 13+
- MediaRecorder API (native browser)
- FormData for multipart uploads
- localStorage for session management

**Backend**:

- Node.js + Express
- MongoDB (Audio schema)
- Firebase Storage (audio files)
- Multipart middleware (multer)

**Audio Format**: WAV (MIME type: audio/wav)

---

## Next Steps (Optional)

- [ ] Add audio preview/playback before upload
- [ ] Add progress bar for upload
- [ ] Add retry logic for failed uploads
- [ ] Add audio duration limit
- [ ] Add visual waveform indicator during recording
- [ ] Store upload timestamp
