import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, googleLogin, deleteAccount } from "../services/auth.api";
import toast from 'react-hot-toast';


export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            toast.success("Login successful!");
            return true;
        } catch (err) {
            toast.error(err.message || "Login failed");
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async (credential) => {
        setLoading(true)
        try {
            const data = await googleLogin(credential)
            setUser(data.user)
            toast.success("Google Login successful!");
            return true;
        } catch (err) {
            toast.error(err.message || "Google Login failed");
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            toast.success("Registration successful!");
            return true;
        } catch (err) {
            toast.error(err.message || "Registration failed");
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
            toast.success("Logged out successfully");
            return true;
        } catch (err) {
            toast.error(err.message || "Logout failed");
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setLoading(true)
        try {
            await deleteAccount()
            setUser(null)
            toast.success("Account deleted successfully");
            return true;
        } catch (err) {
            toast.error(err.message || "Failed to delete account");
            return false;
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleGoogleLogin, handleLogout, handleDeleteAccount }
}