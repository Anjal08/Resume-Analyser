import axios from "axios"


const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:3000`;
    }
    return "http://localhost:3000";
}

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }

}

export async function forgotPassword(email) {
    try {
        const response = await api.post("/api/auth/forgot-password", { email })
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}

export async function resetPassword(token, password) {
    try {
        const response = await api.post(`/api/auth/reset-password/${token}`, { password })
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}

export async function googleLogin(credential) {
    try {
        const response = await api.post("/api/auth/google-login", { credential })
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}

export async function changePassword({ currentPassword, newPassword }) {
    try {
        const response = await api.post("/api/auth/change-password", { currentPassword, newPassword })
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}

export async function deleteAccount() {
    try {
        const response = await api.delete("/api/auth/delete-account")
        return response.data
    } catch (err) {
        console.log(err)
        throw err.response?.data || err
    }
}