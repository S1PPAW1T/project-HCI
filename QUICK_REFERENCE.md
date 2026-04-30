# Quick Reference: Login → Audio Upload Flow

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  Login Page → Receive ID → Store in localStorage → Test Page   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ POST /api/user/login {name, age, consent}
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/user/login                                     │  │
│  │  → Create Audio record with {name, age}                 │  │
│  │  → Return {id, name, age}                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│                    MongoDB (Create)                            │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/audio/upload {id, file}                        │  │
│  │  → Check if audioUrl exists (if yes → reject)            │  │
│  │  → Upload file to Firebase Storage                       │  │
│  │  → Update record with audioUrl                           │  │
│  │  → Return {name, age, audioUrl}                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│                  Firebase Storage (Upload)                      │
│                           ↓                                     │
│                    MongoDB (Update)                            │
└─────────────────────────────────────────────────────────────────┘
         ↑
         │ Response with audioUrl
         │
         └──────────────────────────────────┘
```

---

## Code Examples

### Frontend: Login

```typescript
// app/login/page.tsx
const handleSubmit = async (e) => {
  const response = await fetch(`${API_URL}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, consent }),
  });

  const data = await response.json();
  localStorage.setItem("audioSessionId", data.data.id); // Save ID!
  router.push("/test");
};
```

### Frontend: Audio Upload

```typescript
// Use this in Task 1 page
import { uploadAudio } from "@/app/services/audioService";

const handleUpload = async (audioBlob) => {
  const result = await uploadAudio(audioBlob);
  console.log(result); // { name, age, audioUrl }
};
```

### Backend: User Controller

```javascript
// src/controllers/user.controller.js
exports.login = async (req, res) => {
  const { name, age, consent } = req.body;

  // Create new record
  const audio = await Audio.create({ name, age });

  // Return ID for frontend
  res.status(201).json({
    success: true,
    data: { id: audio._id, name, age },
  });
};
```

### Backend: Audio Controller

```javascript
// src/controllers/audio.controller.js
exports.uploadAudio = async (req, res) => {
  const { id } = req.body;
  const file = req.file;

  // Find record by ID
  const audio = await Audio.findById(id);

  // Check: Only allow first upload
  if (audio.audioUrl) {
    return res.status(400).json({
      message: "Audio already uploaded",
    });
  }

  // Upload to Firebase and update
  const audioUrl = await storageService.uploadToFirebase(file);
  audio.audioUrl = audioUrl;
  await audio.save();

  res.json({
    success: true,
    data: { name: audio.name, age: audio.age, audioUrl },
  });
};
```

---

## File Structure

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── firebase.js         # Firebase setup
│   ├── controllers/
│   │   ├── user.controller.js  # Login logic
│   │   └── audio.controller.js # Upload logic
│   ├── models/
│   │   └── audio.model.js      # MongoDB schema
│   ├── routes/
│   │   ├── user.routes.js      # /api/user/login
│   │   └── audio.routes.js     # /api/audio/upload
│   ├── services/
│   │   └── storage.service.js  # Firebase upload
│   └── middlewares/
│       └── error.middleware.js # Error handling

frontend/
├── app/
│   ├── login/page.tsx          # Login form
│   ├── test/page.tsx           # Audio recording (TODO)
│   ├── services/
│   │   └── audioService.ts     # Upload helper
│   └── components/
│       └── AudioRecordingExample.tsx
```

---

## Environment Setup

### `.env` file

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db
OPENAI_API_KEY=sk-...
PORT=5000
```

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Login creates MongoDB record
- [ ] Login returns ID
- [ ] First audio upload succeeds
- [ ] Second upload attempt fails with "already uploaded" message
- [ ] Firebase URL is publicly accessible
- [ ] MongoDB record has audioUrl

---

## Next Steps

1. **Implement audio recording** in Task 1 page using example component
2. **Add validation** for audio file size/format
3. **Add authentication tokens** for production
4. **Add rate limiting** to prevent spam uploads
5. **Add progress indicators** for large file uploads
6. **Add retry logic** for failed uploads
