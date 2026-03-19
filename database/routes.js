const express = require("express");
const router = express.Router();
const User = require("./user");


// SIGNUP
router.post("/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: "User already exists" });
        }

        const user = new User({
            name,
            email,
            password,
            role: "student"
        });

        await user.save();

        res.json({
            message: "User registered successfully"
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


module.exports = router;