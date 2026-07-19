const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions)


    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }


    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, cookieOptions)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", cookieOptions)

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture
        }
    })

}



const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @name forgotPasswordController
 * @description Generate reset token and console log it
 * @access public
 */
async function forgotPasswordController(req, res) {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "No user found with that email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Log the link for local testing since nodemailer isn't set up
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n\n[FORGOT PASSWORD] Password reset link for ${email}: \n${resetUrl}\n\n`);

    res.status(200).json({ message: "Email sent (check backend console for link)" });
}

/**
 * @name resetPasswordController
 * @description Reset password using token
 * @access public
 */
async function resetPasswordController(req, res) {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
}

/**
 * @name googleLoginController
 * @description login/register a user using Google OAuth token
 * @access Public
 */
async function googleLoginController(req, res) {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub, picture } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            // Register them automatically
            let uniqueUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            user = await userModel.create({
                username: uniqueUsername,
                email,
                googleId: sub,
                profilePicture: picture || ""
            });
        } else {
            // Update their picture if they logged in with Google and it changed
            if (picture && user.profilePicture !== picture) {
                user.profilePicture = picture;
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Google authentication failed" });
    }
}

/**
 * @name changePasswordController
 * @description Change password of currently authenticated user
 * @access Private
 */
async function changePasswordController(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and New password are required." });
    }

    try {
        const user = await userModel.findById(req.user.id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Google logged in users might not have a password
        if (user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect current password." });
            }
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * @name deleteAccountController
 * @description Delete currently authenticated user's account and clean token cookie
 * @access Private
 */
async function deleteAccountController(req, res) {
    try {
        const userId = req.user.id;
        
        // Remove the user from DB
        const deletedUser = await userModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Clear user cookie
        res.clearCookie("token", cookieOptions);
        
        res.status(200).json({ message: "Account deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    forgotPasswordController,
    resetPasswordController,
    googleLoginController,
    changePasswordController,
    deleteAccountController
}