const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    let resumeText = "";
    if (req.file && req.file.buffer) {
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } catch (err) {
            console.error("Failed to parse PDF:", err);
            return res.status(400).json({ message: "Failed to parse resume. Ensure it is a valid PDF." });
        }
    }

    const { selfDescription, jobDescription } = req.body

    if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required." });
    }

    try {
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating report in backend:", error);
        res.status(500).json({ message: "Failed to generate interview strategy due to AI generation error or server issue." });
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport
    const { theme, aiInstruction } = req.body

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription, theme, aiInstruction })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to delete an interview report.
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        });
    }

    res.status(200).json({
        message: "Interview report deleted successfully."
    });
}

/**
 * @description Controller to evaluate a mock interview answer.
 */
async function evaluateAnswerController(req, res) {
    const { evaluateMockInterviewAnswer } = require("../services/ai.service");
    const { question, userAnswer, intention, expectedAnswer, role, difficulty } = req.body;

    if (!question || !userAnswer) {
        return res.status(400).json({ message: "Question and User Answer are required." });
    }

    try {
        const evaluation = await evaluateMockInterviewAnswer({ question, userAnswer, intention, expectedAnswer, role, difficulty });
        res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to evaluate answer." });
    }
}

/**
 * @description Controller to generate the final interview feedback from the complete QnA history.
 */
async function evaluateFinalController(req, res) {
    const { generateFinalInterviewFeedback } = require("../services/ai.service");
    const { role, difficulty, qnaHistory } = req.body;

    if (!qnaHistory || !qnaHistory.length) {
        return res.status(400).json({ message: "QnA History is required for final evaluation." });
    }

    try {
        const finalReport = await generateFinalInterviewFeedback({ role, difficulty, qnaHistory });
        res.status(200).json({
            message: "Final interview report generated successfully.",
            finalReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate final report." });
    }
}

/**
 * @description Controller to save a mock interview history.
 */
async function saveMockInterviewController(req, res) {
    const InterviewHistoryModel = require('../models/interviewHistory.model');
    const { reportId, targetRole, overallScore, strengths, improvements, communicationFeedback, technicalFeedback, aiSuggestions, qnaHistory } = req.body;

    try {
        const history = await InterviewHistoryModel.create({
            user: req.user.id,
            report: reportId,
            targetRole,
            overallScore,
            strengths,
            improvements,
            communicationFeedback,
            technicalFeedback,
            aiSuggestions,
            qnaHistory
        });

        res.status(201).json({
            message: "Mock interview saved successfully.",
            history
        });
    } catch (error) {
        console.error("Error saving mock interview:", error);
        res.status(500).json({ message: "Failed to save mock interview." });
    }
}

/**
 * @description Controller to get all mock interviews for the user.
 */
async function getAllMockInterviewsController(req, res) {
    const InterviewHistoryModel = require('../models/interviewHistory.model');
    try {
        const history = await InterviewHistoryModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Mock interviews fetched successfully.",
            history
        });
    } catch (error) {
        console.error("Error fetching mock interviews:", error);
        res.status(500).json({ message: "Failed to fetch mock interviews." });
    }
}

/**
 * @description Controller to get a mock interview by id.
 */
async function getMockInterviewByIdController(req, res) {
    const InterviewHistoryModel = require('../models/interviewHistory.model');
    try {
        const history = await InterviewHistoryModel.findOne({ _id: req.params.historyId, user: req.user.id });
        if (!history) {
            return res.status(404).json({ message: "Mock interview not found." });
        }
        res.status(200).json({
            message: "Mock interview fetched successfully.",
            history
        });
    } catch (error) {
        console.error("Error fetching mock interview:", error);
        res.status(500).json({ message: "Failed to fetch mock interview." });
    }
}

/**
 * @description Controller to delete a mock interview.
 */
async function deleteMockInterviewController(req, res) {
    const InterviewHistoryModel = require('../models/interviewHistory.model');
    try {
        const history = await InterviewHistoryModel.findOneAndDelete({ _id: req.params.historyId, user: req.user.id });
        if (!history) {
            return res.status(404).json({ message: "Mock interview not found." });
        }
        res.status(200).json({ message: "Mock interview deleted successfully." });
    } catch (error) {
        console.error("Error deleting mock interview:", error);
        res.status(500).json({ message: "Failed to delete mock interview." });
    }
}


module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController, 
    deleteInterviewReportController, 
    evaluateAnswerController,
    evaluateFinalController,
    saveMockInterviewController,
    getAllMockInterviewsController,
    getMockInterviewByIdController,
    deleteMockInterviewController
}