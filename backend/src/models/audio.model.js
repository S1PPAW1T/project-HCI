const mongoose = require("mongoose");

const modelMetricsSchema = new mongoose.Schema(
  {
    transcript: {
      type: String,
      default: "",
    },
    wer: {
      type: Number,
      default: null,
    },
    substitutions: {
      type: Number,
      default: null,
    },
    deletions: {
      type: Number,
      default: null,
    },
    insertions: {
      type: Number,
      default: null,
    },
    referenceWordCount: {
      type: Number,
      default: 0,
    },
    hypothesisWordCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: Number,
      required: true,
    },
    referenceText: {
      type: String,
      default: "",
    },
    models: {
      google: {
        type: modelMetricsSchema,
        default: () => ({}),
      },
      whisper: {
        type: modelMetricsSchema,
        default: () => ({}),
      },
      deepgram: {
        type: modelMetricsSchema,
        default: () => ({}),
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ratingsSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: Number,
      required: true,
    },
    modelName: {
      type: String,
      enum: ["google", "whisper", "deepgram"],
      required: true,
    },
    ratings: {
      type: Map,
      of: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const audioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  audioUrl: {
    type: String,
    required: false,
  },
  evaluations: {
    type: [evaluationSchema],
    default: [],
  },
  ratings: {
    type: [ratingsSchema],
    default: [],
  },
  professorRatings: {
    type: [
      new mongoose.Schema(
        {
          professorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Professor",
            required: true,
          },
          clarity: {
            type: String,
            enum: ["clear", "unclear"],
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Audio", audioSchema);
