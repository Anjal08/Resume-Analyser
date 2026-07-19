import axios from "axios";

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:3000`;
    }
    return "http://localhost:3000";
}

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
})


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription || "")
    formData.append("selfDescription", selfDescription || "")
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/api/interview/", formData)

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


export const generateResumePdf = async ({ interviewReportId, theme, aiInstruction }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, { theme, aiInstruction }, {
        responseType: "blob"
    })

    return response.data
}

/**
 * @description Service to delete an interview report.
 */
export const deleteInterviewReport = async (interviewId) => {
    const response = await api.delete(`/api/interview/report/${interviewId}`)
    return response.data
}

/**
 * @description Service to evaluate an answer in a mock interview.
 */
export const evaluateAnswer = async (evaluationData) => {
    const response = await api.post('/api/interview/evaluate', evaluationData)
    return response.data
}

/**
 * @description Service to generate the final interview feedback.
 */
export const evaluateFinal = async (evaluationData) => {
    const response = await api.post('/api/interview/evaluate-final', evaluationData)
    return response.data
}

/**
 * @description Service to save a completed mock interview to history.
 */
export const saveMockInterview = async (historyData) => {
    const response = await api.post('/api/interview/mock', historyData)
    return response.data
}

/**
 * @description Service to get all mock interviews from history.
 */
export const getAllMockInterviews = async () => {
    const response = await api.get('/api/interview/mock')
    return response.data
}

/**
 * @description Service to get a single mock interview by ID.
 */
export const getMockInterviewById = async (historyId) => {
    const response = await api.get(`/api/interview/mock/${historyId}`)
    return response.data
}

/**
 * @description Service to delete a mock interview from history.
 */
export const deleteMockInterview = async (historyId) => {
    const response = await api.delete(`/api/interview/mock/${historyId}`)
    return response.data
}