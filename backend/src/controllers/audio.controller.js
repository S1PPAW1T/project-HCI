const Audio = require("../models/audio.model");
const storageService = require("../services/storage.service");
const speechService = require("../services/speech.service");

const taskReferenceTexts = {
  1: "Last Thursday, I requested a new project task. My boss asked if the finished report was fixed and uploaded. Specifically, I processed the data twice to ensure the results were accurate. If the system crashes again, we might miss the deadline, and the entire business will suffer.",
  2: "Please sit in the correct seat before we begin. I need to ship the sheep to the island by noon. It is a great opportunity to improve my leadership skills. If we slip on the floor, we might sleep in the hospital tonight.",
  3: "The photographer took many photographs for the biography section. We must evaluate the economic situation immediately. He was comfortable with the technology, but the delivery was delayed. It is necessary to communicate with the entire community.",
  4: "The strong structure of the bridge attracts many strangers. We brought three fresh fruits from the street market. It starts at eight o'clock sharp. Please don't forget to check the clocks and spring into action.",
  5: "I can't understand why he shouldn't accept the offer. Actually, specifically, it wasn't available yesterday. The quality of the product doesn't match the description. We mustn't ignore the problem, or it won't be solved easily.",
};

const normalizeWords = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]+/gi, " ")
    .split(/\s+/)
    .filter(Boolean);

const computeWerMetrics = (referenceText, hypothesisText) => {
  const referenceWords = normalizeWords(referenceText);
  const hypothesisWords = normalizeWords(hypothesisText);
  const referenceWordCount = referenceWords.length;
  const hypothesisWordCount = hypothesisWords.length;

  if (referenceWordCount === 0) {
    return {
      wer: null,
      substitutions: null,
      deletions: null,
      insertions: null,
      referenceWordCount,
      hypothesisWordCount,
    };
  }

  const m = referenceWordCount;
  const n = hypothesisWordCount;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const op = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));

  for (let i = 1; i <= m; i += 1) {
    dp[i][0] = i;
    op[i][0] = "del";
  }

  for (let j = 1; j <= n; j += 1) {
    dp[0][j] = j;
    op[0][j] = "ins";
  }

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (referenceWords[i - 1] === hypothesisWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        op[i][j] = "corr";
      } else {
        const deletion = dp[i - 1][j] + 1;
        const insertion = dp[i][j - 1] + 1;
        const substitution = dp[i - 1][j - 1] + 1;
        const min = Math.min(deletion, insertion, substitution);
        dp[i][j] = min;
        op[i][j] =
          min === substitution ? "sub" : min === deletion ? "del" : "ins";
      }
    }
  }

  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    const operation = op[i]?.[j];

    if (i > 0 && j > 0 && operation === "corr") {
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && operation === "sub") {
      substitutions += 1;
      i -= 1;
      j -= 1;
    } else if (i > 0 && operation === "del") {
      deletions += 1;
      i -= 1;
    } else if (j > 0 && operation === "ins") {
      insertions += 1;
      j -= 1;
    } else if (i > 0) {
      deletions += 1;
      i -= 1;
    } else if (j > 0) {
      insertions += 1;
      j -= 1;
    }
  }

  const wer = Number(
    ((substitutions + deletions + insertions) / referenceWordCount).toFixed(3),
  );

  return {
    wer,
    substitutions,
    deletions,
    insertions,
    referenceWordCount,
    hypothesisWordCount,
  };
};

const buildModelEvaluation = (referenceText, transcript) => {
  return {
    transcript,
    ...computeWerMetrics(referenceText, transcript),
  };
};

const saveSpeechEvaluation = async (audioId, taskNumber, transcriptions) => {
  const audio = await Audio.findById(audioId);
  if (!audio) {
    throw new Error("Audio record not found");
  }

  const referenceText = taskReferenceTexts[taskNumber] || "";
  const evaluation = {
    taskNumber,
    referenceText,
    models: {
      whisper: buildModelEvaluation(referenceText, transcriptions.whisper),
    },
    createdAt: new Date(),
  };

  audio.evaluations = audio.evaluations || [];
  const existingIndex = audio.evaluations.findIndex(
    (item) => item.taskNumber === taskNumber,
  );

  if (existingIndex >= 0) {
    audio.evaluations[existingIndex] = evaluation;
  } else {
    audio.evaluations.push(evaluation);
  }

  await audio.save();
  return evaluation;
};

exports.uploadAudio = async (req, res, next) => {
  try {
    const { id, task } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!id) {
      return res.status(400).json({ message: "Audio record ID is required" });
    }

    const taskNumber = parseInt(task) || 1;

    // Task 1: Upload audio to Firebase and save to MongoDB
    if (taskNumber === 1) {
      return handleTask1Upload(id, file, res, next);
    }

    // Tasks 2-5: Convert audio to text using speech-to-text
    return handleTaskSpeechToText(id, file, taskNumber, res, next);
  } catch (err) {
    next(err);
  }
};

// Task 1: Upload audio file to Firebase Storage
const handleTask1Upload = async (id, file, res, next) => {
  try {
    // Find the existing Audio record
    const audio = await Audio.findById(id);

    if (!audio) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    // Check if audio has already been uploaded (only allow first recording)
    if (audio.audioUrl) {
      return res.status(400).json({
        message: "Audio already uploaded. Only the first recording is saved.",
      });
    }

    // Upload to Firebase
    const audioUrl = await storageService.uploadToFirebase(file);

    // Update the record with audioUrl
    audio.audioUrl = audioUrl;
    await audio.save();

    // Also transcribe with all 3 models for Task 1
    const transcriptions = await speechService.transcribeWithAllModels(
      file.buffer,
      `task${1}.wav`,
    );

    const evaluation = await saveSpeechEvaluation(id, 1, transcriptions);

    res.json({
      success: true,
      message: "Audio uploaded successfully to Firebase and transcribed",
      data: {
        name: audio.name,
        age: audio.age,
        audioUrl: audio.audioUrl,
        models: transcriptions,
        evaluation,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Tasks 2-5: Convert audio to text using speech-to-text API
const handleTaskSpeechToText = async (id, file, taskNumber, res, next) => {
  try {
    console.log(
      `🎙️  Task ${taskNumber}: Converting audio to text with 3 models...`,
    );

    // Convert audio buffer to text using all 3 models
    const transcriptions = await speechService.transcribeWithAllModels(
      file.buffer,
      `task${taskNumber}.wav`,
    );

    console.log(`✓ Task ${taskNumber} transcription complete with 3 models`);

    const evaluation = await saveSpeechEvaluation(
      id,
      taskNumber,
      transcriptions,
    );

    const userRecord = await Audio.findById(id);
    if (!userRecord) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    res.json({
      success: true,
      message: `Task ${taskNumber} audio converted to text using 3 models`,
      task: taskNumber,
      data: {
        models: transcriptions,
        taskNumber: taskNumber,
        userId: id,
        userName: userRecord.name,
        evaluation,
      },
    });
  } catch (err) {
    console.error(`❌ Task ${taskNumber} transcription failed:`, err.message);
    next(err);
  }
};

exports.getEvaluations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const audio = await Audio.findById(id);

    if (!audio) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    res.json({
      success: true,
      data: {
        userId: audio._id,
        name: audio.name,
        age: audio.age,
        audioUrl: audio.audioUrl,
        evaluations: audio.evaluations || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.saveRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ratings } = req.body;

    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ message: "Invalid ratings data" });
    }

    const audio = await Audio.findById(id);
    if (!audio) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    audio.ratings = audio.ratings || [];

    const ratingsByModelTask = {};
    for (const [key, value] of Object.entries(ratings)) {
      const match = key.match(/^task(\d+)_(\w+)_q(\d+)$/);
      if (match) {
        const [, taskNum, modelName, questionNum] = match;
        const compositeKey = `${taskNum}-${modelName}`;
        if (!ratingsByModelTask[compositeKey]) {
          ratingsByModelTask[compositeKey] = {
            taskNumber: parseInt(taskNum),
            modelName,
            ratings: {},
          };
        }
        ratingsByModelTask[compositeKey].ratings[`q${questionNum}`] = value;
      }
    }

    for (const ratingData of Object.values(ratingsByModelTask)) {
      const existingIndex = audio.ratings.findIndex(
        (r) =>
          r.taskNumber === ratingData.taskNumber &&
          r.modelName === ratingData.modelName,
      );
      if (existingIndex >= 0) {
        audio.ratings[existingIndex] = ratingData;
      } else {
        audio.ratings.push(ratingData);
      }
    }

    await audio.save();

    res.json({
      success: true,
      message: "Ratings saved successfully",
      data: {
        userId: audio._id,
        ratingsCount: audio.ratings.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
