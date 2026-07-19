import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import MockInterview from "./features/interview/pages/MockInterview";
import MockInterviewReportPage from "./pages/MockInterviewReportPage";
import Profile from "./features/profile/pages/Profile";
import DashboardLayout from "./components/DashboardLayout";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";
import AIInterviewPage from "./pages/AIInterviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LearningHubPage from "./pages/LearningHubPage";
import SettingsPage from "./pages/SettingsPage";
export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/reset-password/:token",
        element: <ResetPassword />
    },
    {
        path: "/",
        element: <DashboardLayout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/profile",
                element: <Protected><Profile /></Protected>
            },
            {
                path: "/resume-analysis",
                element: <Protected><ResumeAnalysisPage /></Protected>
            },
            {
                path: "/mock-interview-report/:historyId",
                element: <Protected><MockInterviewReportPage /></Protected>
            },
            {
                path: "/ai-interview",
                element: <Protected><AIInterviewPage /></Protected>
            },
            {
                path: "/analytics",
                element: <Protected><AnalyticsPage /></Protected>
            },
            {
                path: "/learning-hub",
                element: <Protected><LearningHubPage /></Protected>
            },
            {
                path: "/settings",
                element: <Protected><SettingsPage /></Protected>
            },
            {
                path: "/interview/:interviewId",
                element: <Protected><Interview /></Protected>
            }
        ]
    },
    {
        path:"/mock-interview/:interviewId",
        element: <Protected><MockInterview /></Protected>
    }
])