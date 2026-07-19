import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport, evaluateAnswer, evaluateFinal, saveMockInterview, getAllMockInterviews, getMockInterviewById, deleteMockInterview } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return { data: response.interviewReport, error: null }
        } catch (error) {
            console.error("Error generating report:", error)
            const errorMsg = error.response?.data?.message || "Failed to generate interview strategy. Please ensure all required fields are filled correctly and the resume is a valid PDF."
            return { data: null, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdfBlob = async (interviewReportId, theme, aiInstruction) => {
        try {
            const response = await generateResumePdf({ interviewReportId, theme, aiInstruction })
            if (response.type === "application/json") {
                const text = await response.text();
                const json = JSON.parse(text);
                throw new Error(json.message || "Failed to generate PDF.");
            }
            return window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
        } catch (error) {
            console.error("Error loading preview:", error)
            return null
        }
    }

    const getResumePdf = async (interviewReportId, theme, aiInstruction) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId, theme, aiInstruction })
            
            // If the response is surprisingly JSON (e.g. backend error returned as blob), handle it
            if (response.type === "application/json") {
                const text = await response.text();
                const json = JSON.parse(text);
                throw new Error(json.message || "Failed to generate PDF.");
            }

            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            // Clean up
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error("Error downloading resume:", error)
            alert("Failed to download the resume. Ensure the report has a valid resume attached.")
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (interviewId) => {
        setLoading(true)
        try {
            await deleteInterviewReport(interviewId)
            setReports(prev => prev.filter(r => r._id !== interviewId))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const evaluateMockAnswer = async (data) => {
        try {
            const response = await evaluateAnswer(data);
            return response.evaluation;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const generateFinalFeedback = async (data) => {
        try {
            const response = await evaluateFinal(data);
            return response.finalReport;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    const saveHistory = async (historyData) => {
        try {
            const response = await saveMockInterview(historyData);
            return response.history;
        } catch (error) {
            console.error("Error saving mock interview:", error);
            return null;
        }
    }

    const getHistory = async () => {
        try {
            const response = await getAllMockInterviews();
            return response.history;
        } catch (error) {
            console.error("Error fetching mock interviews:", error);
            return [];
        }
    }

    const getHistoryById = async (id) => {
        try {
            const response = await getMockInterviewById(id);
            return response.history;
        } catch (error) {
            console.error("Error fetching mock interview:", error);
            return null;
        }
    }

    const deleteHistory = async (id) => {
        try {
            await deleteMockInterview(id);
            return true;
        } catch (error) {
            console.error("Error deleting mock interview:", error);
            return false;
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, getResumePdfBlob, deleteReport, evaluateMockAnswer, generateFinalFeedback, saveHistory, getHistory, getHistoryById, deleteHistory }

}