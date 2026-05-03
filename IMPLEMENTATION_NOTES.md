# Speech-to-Text Implementation Notes

## What Was Implemented

### Backend Changes

1. **Updated `speech.service.js`**:
   - Added Google Cloud Speech-to-Text integration
   - Added Deepgram API integration
   - Kept existing OpenAI Whisper integration
   - Created `transcribeWithAllModels()` function that runs all 3 models in parallel

2. **Updated `audio.controller.js`**:
   - Modified `handleTaskSpeechToText()` to use multi-model transcription
   - Now returns results from all 3 models: Google, Whisper, and Deepgram

3. **Installed new packages**:
   - @google-cloud/speech@6
   - @deepgram/sdk
   - axios

### Frontend Changes

1. **Updated `test/page.tsx`**:
   - Added state variables for `modelResults` and `isTranscribing`
   - Modified `uploadAudio()` function to:
     - Send task number to backend
     - Handle transcription results for tasks 2-5
     - Display upload confirmation for task 1
   - Updated display to show model-specific results on pages 2-4:
     - Page 2: Google Cloud Speech-to-Text results
     - Page 3: OpenAI Whisper results
     - Page 4: Deepgram results
   - Fixed TypeScript type errors

## Workflow

### Task 1:
- **Page 1**: User records audio, clicks "Next" to upload to Firebase
- **Pages 2-4**: User sees review questions and rates their experience

### Tasks 2-5:
- **Page 1**: User records audio, clicks "Next" to:
  1. Upload audio file
  2. Trigger transcription with all 3 models in parallel
- **Pages 2-4**: 
  - Page 2: Shows Google Cloud Speech-to-Text results
  - Page 3: Shows OpenAI Whisper results
  - Page 4: Shows Deepgram results
  - Each page includes review questions for that model

## Required Environment Variables

To make this work, you need to set up the following:

### Google Cloud Speech-to-Text

1. Create a Google Cloud project
2. Enable the Speech-to-Text API
3. Create a service account and download the JSON key
4. Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS`
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

### Deepgram

1. Sign up at https://console.deepgram.com
2. Create an API key
3. Set environment variable: `DEEPGRAM_API_KEY`
   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

### OpenAI (Already configured)

- Ensure `OPENAI_API_KEY` is set in your environment

## Testing Steps

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the flow**:
   - Login with a test account
   - Go to Test Stimuli page
   - Record audio on Task 1, Page 1
   - Click "Next" to upload to Firebase
   - Go through pages 2-4 to see review questions
   - Move to Task 2, Page 1
   - Record new audio
   - Click "Next" to trigger transcription with all 3 models
   - Check pages 2-4 to see results from each model

## API Response Format (Tasks 2-5)

When uploading audio for tasks 2-5, the response will include:

```json
{
  "success": true,
  "message": "Task X audio converted to text using 3 models",
  "task": 2,
  "data": {
    "models": {
      "google": "transcription from Google Cloud...",
      "whisper": "transcription from OpenAI Whisper...",
      "deepgram": "transcription from Deepgram..."
    },
    "taskNumber": 2,
    "userId": "session_id",
    "userName": "User Name"
  }
}
```

## Notes

- Google Cloud Speech-to-Text is set as the primary model (shown on page 2)
- If any model fails, it will return an error message instead
- All 3 models run in parallel for faster processing
- The frontend currently doesn't store transcription results in the database; you may want to add this functionality later

## Future Improvements

1. Store transcription results in MongoDB for later analysis
2. Add comparison view to see all 3 results side-by-side
3. Add confidence scores or accuracy metrics from each model
4. Create an admin dashboard to analyze transcription quality
5. Add support for different languages
6. Implement caching to avoid re-transcribing the same audio
