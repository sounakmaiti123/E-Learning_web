const express = require("express");
const router = express.Router();
const User = require("./user");
const nodemailer = require("nodemailer");

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// SIGNUP
router.post("/signup", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: "User already exists" });
        }

        const user = new User({
            name,
            email,
            password,
            role: role || "student"
        });

        await user.save();

        // Send Professional Welcome Email
        const mailOptions = {
            from: `"EduChain" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to EduChain! 🚀',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">EduChain</h1>
                    </div>
                    <h2 style="color: #1f2937; font-size: 22px; text-align: center;">Welcome aboard, ${user.name}! 🎉</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We are thrilled to have you join our learning community. EduChain is designed to help you learn without boundaries, equipped with AI-powered tutoring and secure face recognition.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">What's next?</h3>
                        <ul style="color: #4b5563; font-size: 16px; line-height: 1.6; padding-left: 20px; margin-bottom: 0;">
                            <li>Browse our catalog of premium courses</li>
                            <li>Set up your personalized profile</li>
                            <li>Engage with the community</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/login.html" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Get Started Now</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 0;">If you have any questions, simply reply to this email. We're here to help!</p>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 10px;">&copy; ${new Date().getFullYear()} EduChain. All Rights Reserved.</p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions).catch(err => console.error("Error sending welcome email:", err));

        res.json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic || null
            }
        });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Signup error" });

    }

});



// LOGIN
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.json({ message: "Invalid password" });
        }

        res.json({
message: "Login successful",
user: user   // includes profilePic
});

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Login error" });

    }

});
// UPDATE PROFILE IMAGE
router.post("/update-profile", async (req, res) => {

    try {
        const { email, profilePic } = req.body;

        const user = await User.findOneAndUpdate(
            { email: email },
            { profilePic: profilePic },
            { new: true }
        );

        res.json({
            message: "Profile updated",
            user: user
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating profile" });
    }

});


// ===================================
//  COURSE UPLOAD & RETRIEVAL ROUTES
// ===================================
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Course = require("./course");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads/courses");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB video/image limit
    }
});

// GET all courses
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ message: "Error fetching courses" });
    }
});

// POST upload new course with thumbnail and video files
router.post(
    "/upload-course",
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "video", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { title, instructor, price, description } = req.body;

            if (!req.files || !req.files["thumbnail"] || !req.files["video"]) {
                return res.status(400).json({ message: "Thumbnail and video files are required" });
            }

            const thumbnailFile = req.files["thumbnail"][0];
            const videoFile = req.files["video"][0];

            // Relative paths for frontend accessibility
            const thumbnailUrl = `/uploads/courses/${thumbnailFile.filename}`;
            const videoUrl = `/uploads/courses/${videoFile.filename}`;

            const newCourse = new Course({
                title,
                instructor,
                price: parseFloat(price) || 0,
                description,
                thumbnail: thumbnailUrl,
                video: videoUrl
            });

            await newCourse.save();

            res.json({
                message: "Course uploaded successfully",
                course: newCourse
            });
        } catch (error) {
            console.error("Upload course error:", error);
            res.status(500).json({ message: "Error uploading course" });
        }
    }
);


module.exports = router;