const mongoose = require('mongoose');


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
    },
    roundNumber: {
        type: Number
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    assignedTopic: {
        type: String
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
})

const resumeProfileSchema = new mongoose.Schema({
    skills: [String],
    projects: [String],
    experience: [String],
    education: [String],
    certifications: [String],
    technologies: [String],
    summary: { type: String },
    proficiency: { type: String }
}, { _id: false });

const questionPlanSchema = new mongoose.Schema({
    roundNumber: { type: Number, required: true },
    assignedTopic: { type: String, required: true },
    topicType: { type: String, required: true },
    difficultyTarget: { type: String, required: true }
}, { _id: false });

const scoreBreakdownSchema = new mongoose.Schema({
    requiredSkills: { type: Number },
    technicalSkills: { type: Number },
    projectRelevance: { type: Number },
    experience: { type: Number },
    keywordCoverage: { type: Number },
    education: { type: Number },
    atsReadability: { type: Number },
    evidenceStrength: { type: Number }
}, { _id: false });

const interviewQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    category: { type: String },
    difficulty: { type: String },
    reason: { type: String },
    relatedSkill: { type: String },
    source: { type: String }
}, { _id: false });

const skillMatchSchema = new mongoose.Schema({
    skill: { type: String, required: true },
    category: { type: String },
    status: { type: String },
    confidence: { type: Number },
    evidence: [String],
    sources: [String],
    remainingGap: { type: String }
}, { _id: false });

const missingSkillSchema = new mongoose.Schema({
    skill: { type: String, required: true },
    priority: { type: String },
    type: { type: String }
}, { _id: false });

const skillAnalysisSchema = new mongoose.Schema({
    strongMatches: [ skillMatchSchema ],
    partialMatches: [ skillMatchSchema ],
    missingSkills: [ missingSkillSchema ]
}, { _id: false });

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    scoreBreakdown: scoreBreakdownSchema,
    interviewQuestions: [ interviewQuestionSchema ],
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    matchedSkills: [ String ],
    skillAnalysis: skillAnalysisSchema,
    preparationPlan: [ preparationPlanSchema ],
    resumeProfile: resumeProfileSchema,
    roadmap: [ questionPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    timestamps: true
})


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;  