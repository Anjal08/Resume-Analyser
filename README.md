# Interview Master 🚀

**Interview Master** is an AI-powered interview preparation platform designed to help candidates align their resumes with target job descriptions. The system parses uploaded resumes, calculates match scores, highlights critical skill gaps, creates customized daily study plans, and generates tailored resumes exported as clean, ATS-compliant PDFs.

---

## 🌟 Key Technical Highlights (What Recruiters Look For)

*   **Strictly Structured LLM Integration:** Uses the official `@google/genai` Node.js SDK with Google's Gemini models. Integrates **Zod Schema validation** and `zod-to-json-schema` to enforce type-safe JSON API outputs directly matching the database layer, avoiding runtime parsing failures.
*   **Headless PDF Engine (ATS-Friendly):** Dynamically tailors a candidate's background into custom HTML/CSS resumes based on target JDs. Uses **Puppeteer** in the backend to spin up a headless browser and print the content to vector PDFs, preserving text selection and searchability for Applicant Tracking Systems.
*   **Secure Cookie-Based Sessions:** Implements stateless JWT authentication. Tokens are stored in secure **HTTP-Only cookies** to defend against Cross-Site Scripting (XSS) attacks.
*   **Revocation Blacklist:** Tracks logged-out sessions via a MongoDB collection with automated **Time-To-Live (TTL) indexes**, purging expired sessions automatically.
*   **DNS Resilience Workaround:** Resolves database connection failures (like `querySrv ECONNREFUSED` on local DNS setups) by overriding Node's default resolver with public DNS servers programmatically at runtime.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Sass (SCSS), Axios |
| **Backend** | Node.js, Express.js, Multer (multipart file upload), pdf-parse |
| **Database** | MongoDB, Mongoose ODM |
| **AI & PDF** | Google Gemini (`gemini-3-flash-preview`), Puppeteer (headless browser PDF generation) |

---

## 📂 Project Structure

```text
├── Backend/               # Express server, controllers, models, and AI services
│   ├── src/
│   │   ├── config/        # Database connections and DNS configuration
│   │   ├── controllers/   # Route controller handlers
│   │   ├── middlewares/   # JWT verification and Multer file upload filters
│   │   ├── models/        # Mongoose User, Blacklist, and Report schemas
│   │   ├── routes/        # Router endpoint mappings
│   │   └── services/      # Gemini API wrappers and Puppeteer engines
│   └── server.js          # App entry point
├── Frontend/              # React frontend
│   ├── src/
│   │   ├── features/      # Feature-based folder structure (Auth, Interview)
│   │   ├── hooks/         # Custom React hooks (useAuth, useInterview)
│   │   └── main.jsx       # App entry and routing config
└── README.md              # Main project documentation
```

---

## ⚙️ Local Setup Guide

Follow these steps to run the client and server applications on your local machine.

### Prerequisites
*   Node.js (v18.x or above recommended)
*   MongoDB instance (local or MongoDB Atlas cluster)

### 1. Configure the Backend
Navigate to the backend directory, install packages, and set up your environment variables:

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder and insert your credentials:
```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_GENAI_API_KEY=your_gemini_api_key
JWT_SECRET=your_custom_jwt_secret_key
```

Start the backend server in development mode (runs on port `3000`):
```bash
npm run dev
```

### 2. Configure the Frontend
Open a new terminal window, navigate to the frontend directory, install packages, and start the development server:

```bash
cd Frontend
npm install
npm run dev
```
The client application will run on: **`http://localhost:5173/`**

---

## 🔄 Core Workflows & Data Flow

1.  **Authentication:** The browser requests access to private routes. `Protected.jsx` checks the React state. If unauthenticated, it redirects the user to `/login`. Upon successful login, the backend issues an HTTP-Only cookie containing the signed JWT.
2.  **Report Generation:** The user uploads a resume PDF and enters a job description. The backend extracts text using `pdf-parse` and sends it to the Gemini API alongside target criteria. Gemini computes a compatibility report in JSON structure, which is stored in MongoDB and returned to the UI.
3.  **PDF Resumes:** The user clicks "Download Resume" in the report view. The backend generates custom HTML highlighting target keywords, compiles the page into a PDF buffer using Puppeteer, and sends the stream as a downloadable attachment.
