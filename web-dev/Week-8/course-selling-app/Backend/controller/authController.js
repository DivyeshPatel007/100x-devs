const { z, ZodError } = require('zod');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const User = require('../models/userModel');
const Role = require('../models/roleModel');


module.exports = { register, login }

const registerSchema = z.object({
    firstName: z.string().trim().min(1, "Firstname is required").max(50, "Firstname is too long"),
    lastName: z.string().trim().min(1, "Lastname is required").max(50, "Lastname is too long"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
})

async function register(req, res) {

    try {
        const { firstName, lastName, email, password } = registerSchema.parse(req.body)

        const existingUser = await User.findOne({ email });


        if (existingUser) {
            return res.status(402).json({
                error: "User already exist"
            })
        }

        const role = await Role.findOne({ role: "user" });
        if (!role) {
            return res.status(404).json({ error: "Role 'user' does not exist" });
        }

        const encryptPassword = await bcrypt.hash(password, 10);

        const payload = {
            email,
            roleId: role._id,
            firstName,
            lastName,
        }


        const token = jwt.sign(payload, process.env.JWT_SECRET)

        const user = await User.create({ firstName, lastName, password: encryptPassword, roleId: role._id, email, token })





        const { firstName: sanitizeFirstName, lastName: sanitizeLastName, email: sanitizeEmail, roleId, avatarURL, token: sanitizeToken } = user.toObject()


        const sanitizedUser = {
            firstName: sanitizeFirstName,
            lastName: sanitizeLastName,
            email: sanitizeEmail,
            avatarURL,
            roleId
        }


        return res.status(201).json({
            message: "User created successfully",
            user: sanitizedUser,
            auth: sanitizeToken
        });






    } catch (error) {
        console.log("Error: error in authController: register ", error)
    }

}


const loginSchema = z.object({

    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character")
})

async function login(req, res) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Email or password is wrong" })
        }

        const validateUser = await bcrypt.compare(password, user.password);

        if (!validateUser) {
            return res.status(401).json({ error: "Email or password is invalid" })
        }

        const { firstName, lastName, email: sanitizeEmail, avatarURL, token, roleId } = user


        return res.status(200).json({
            message: "User logged in succesfully",
            user: {
                firstName,
                lastName,
                email: sanitizeEmail,
                avatarURL, roleId
            },
            token
        })



    } catch (error) {
        console.log("ERROR: error in authController: login ", error)
    }
}