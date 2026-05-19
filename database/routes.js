const express = require("express");
const router = express.Router();
const User = require("./user");


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