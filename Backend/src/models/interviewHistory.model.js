const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
    question: { type: String, required: true },
    userAnswer: { type: String, required: true },
    aiScore: { type: Number, required: true },
    aiFeedback: { type: String, required: true },
    intention: { type: String }
});

const interviewHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'interviewReport',
        required: true
    },
    targetRole: {
        type: String,
        required: true
    },
    overallScore: {
        type: Number,
        required: true
    },
    strengths: {
        type: [String],
        default: []
    },
    improvements: {
        type: [String],
        default: []
    },
    communicationFeedback: {
        type: String
    },
    technicalFeedback: {
        type: String
    },
    aiSuggestions: {
        type: [String],
        default: []
    },
    qnaHistory: [qnaSchema]
}, { timestamps: true });

module.exports = mongoose.model('InterviewHistory', interviewHistorySchema);
