require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./database/passport");
const connectDB = require("./database/db");
const routes = require("./database/routes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Session (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || "educhain-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", routes);


// =====================
//  GOOGLE AUTH ROUTES
// =====================

// Start Google OAuth (used for both Sign In and Sign Up)
app.get("/auth/google", (req, res, next) => {
    if (req.query.role) {
        req.session.pendingRole = req.query.role;
    }
    next();
}, passport.authenticate("google", {
    scope: ["profile", "email"]
}));

// Google OAuth callback
app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login.html?error=google_failed"
    }),
    (req, res) => {
        // Successful auth — redirect to a handler page that stores user in localStorage
        const user = req.user;
        const userData = encodeURIComponent(JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role,
            googleId: user.googleId
        }));
        res.redirect(`/auth-success.html?user=${userData}`);
    }
);

// Logout route
app.get("/auth/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect("/index.html");
    });
});

// Get current session user (for pages that need to check auth)
app.get("/api/current-user", (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            profilePic: req.user.profilePic,
            role: req.user.role
        });
    } else {
        res.json(null);
    }
});


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});