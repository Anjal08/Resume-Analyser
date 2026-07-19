const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


/**
 * @route POST /api/auth/google-login
 * @description Login or Register via Google OAuth
 * @access Public
 */
authRouter.post("/google-login", authController.googleLoginController)

/**
 * @route POST /api/auth/forgot-password
 * @description Request a password reset link
 * @access Public
 */
authRouter.post("/forgot-password", authController.forgotPasswordController)

/**
 * @route POST /api/auth/reset-password/:token
 * @description Reset password with valid token
 * @access Public
 */
authRouter.post("/reset-password/:token", authController.resetPasswordController)

/**
 * @route POST /api/auth/change-password
 * @description Change password of currently authenticated user
 * @access Private
 */
authRouter.post("/change-password", authMiddleware.authUser, authController.changePasswordController)

/**
 * @route DELETE /api/auth/delete-account
 * @description Delete currently authenticated user account
 * @access Private
 */
authRouter.delete("/delete-account", authMiddleware.authUser, authController.deleteAccountController)

module.exports = authRouter