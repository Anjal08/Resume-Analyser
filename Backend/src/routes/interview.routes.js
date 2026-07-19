const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)



/**
 * @route DELETE /api/interview/report/:interviewId
 * @description Delete an interview report by interviewId.
 * @access private
 */
interviewRouter.delete("/report/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController)

/**
 * @route POST /api/interview/evaluate
 * @description Evaluate a mock interview answer.
 * @access private
 */
interviewRouter.post("/evaluate", authMiddleware.authUser, interviewController.evaluateAnswerController)

/**
 * @route POST /api/interview/evaluate-final
 * @description Generate final feedback for a completed mock interview.
 * @access private
 */
interviewRouter.post("/evaluate-final", authMiddleware.authUser, interviewController.evaluateFinalController)

/**
 * @route POST /api/interview/mock
 * @description Save a mock interview history.
 * @access private
 */
interviewRouter.post("/mock", authMiddleware.authUser, interviewController.saveMockInterviewController)

/**
 * @route GET /api/interview/mock
 * @description Get all mock interviews.
 * @access private
 */
interviewRouter.get("/mock", authMiddleware.authUser, interviewController.getAllMockInterviewsController)

/**
 * @route GET /api/interview/mock/:historyId
 * @description Get mock interview by ID.
 * @access private
 */
interviewRouter.get("/mock/:historyId", authMiddleware.authUser, interviewController.getMockInterviewByIdController)

/**
 * @route DELETE /api/interview/mock/:historyId
 * @description Delete a mock interview.
 * @access private
 */
interviewRouter.delete("/mock/:historyId", authMiddleware.authUser, interviewController.deleteMockInterviewController)

module.exports = interviewRouter