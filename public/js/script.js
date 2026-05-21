const BASE_URL = "https://educhain-sounak-backend.onrender.com";
console.log("EduChain UI Loaded");

/* ---------- GLOBAL SMOOTH SCROLL (LENIS) ---------- */
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

const section = document.querySelector(".learning-content");

if (section) {
    window.addEventListener("scroll", () => {
        const sectionTop = section.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (sectionTop < screenHeight - 150) {
            section.classList.add("show");
        }
    });
}

const coursesSection = document.querySelector(".featured-courses");

if (coursesSection) {
    window.addEventListener("scroll", () => {
        const top = coursesSection.getBoundingClientRect().top;
        const screen = window.innerHeight;

        if (top < screen - 150) {
            coursesSection.classList.add("show");
        }
    });
}

const openBtn = document.getElementById("openVideo");
const modal = document.getElementById("videoModal");
const closeBtn = document.getElementById("closeVideo");
const video = document.getElementById("introVideo");

if (openBtn && modal && video) {
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
        video.play();
    });
}

if (closeBtn && modal && video) {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        video.pause();
        video.currentTime = 0;
    });
}

if (modal && video) {
    // Close when clicking outside video
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("video-overlay")) {
            modal.classList.remove("active");
            video.pause();
            video.currentTime = 0;
        }
    });
}

// Navbar scroll effect
const navbar = document.querySelector(".navbar");

if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

if (toggleBtn) {
    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        toggleBtn.textContent = "☀️";
    }

    // Toggle theme
    toggleBtn.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        body.classList.toggle("dark-mode");

        if (body.classList.contains("light-mode")) {
            toggleBtn.textContent = "☀️";
            localStorage.setItem("theme", "light");
        } else {
            toggleBtn.textContent = "🌙";
            localStorage.setItem("theme", "dark");
        }
    });
}

const signupForm = document.getElementById("signupForm");

if (signupForm) {

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${BASE_URL}/api/signup`, {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })

    });

    const data = await response.json();

    alert(data.message);

});
}

const user = JSON.parse(localStorage.getItem("user"));

if(user){

const signinBtn = document.querySelector(".signin");
const getStartedBtn = document.querySelector(".btn-primary");

if(signinBtn) signinBtn.style.display="none";
if(getStartedBtn) getStartedBtn.style.display="none";

// Only render simple avatar if there's no custom navActions script AND no avatar is already rendered
if(!document.getElementById("navActions") && !document.querySelector(".avatar") && !document.querySelector(".avatar-container")){
const avatar = document.createElement("div");
avatar.className = "avatar";

if(user.profilePic){

avatar.innerHTML = `<img src="${user.profilePic}" alt="avatar">`;

} else {

avatar.innerText = user.name.charAt(0).toUpperCase();

}

const navActions = document.querySelector(".nav-actions");
if(navActions) navActions.appendChild(avatar);
}

}
/* LOGIN GUARD */

function requireLogin(){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

alert("Please login first");

window.location.href = "/login.html";

}

}

/* TEACHER ACCESS GUARD */
function requireTeacher(){
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        alert("Please login first");
        window.location.href = "/login.html";
        return;
    }
    if(user.role !== "teacher"){
        alert("Access Denied: Only teachers are allowed to upload courses.");
        window.location.href = "/index.html";
    }
}

/* NAVBAR LINK PROTECTION */

setTimeout(() => {

const protectedLinks = document.querySelectorAll(".protected-link");

protectedLinks.forEach(link => {

link.addEventListener("click", function(e){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

e.preventDefault();

alert("Please login first");

window.location.href = "/login.html";

} else if (link.getAttribute("href") === "upload-course.html" && user.role !== "teacher") {

e.preventDefault();

alert("Access Denied: Only teachers can access this section.");

window.location.href = "/index.html";

}

});

});

}, 200);

// Global link visibility based on role
document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const uploadLinks = document.querySelectorAll('a[href="upload-course.html"]');
    if (!user || user.role !== "teacher") {
        uploadLinks.forEach(link => link.style.display = "none");
    }
});
/* PROFILE MODAL */

const profileModal = document.getElementById("profileModal");

document.addEventListener("click", function(e){

if(e.target.id === "openProfile"){
profileModal.style.display = "flex";
}

});

function closeProfile(){
profileModal.style.display = "none";
}

/* OPEN PROFILE MODAL */

setTimeout(() => {

const profileBtn = document.getElementById("openProfile");
const modal = document.getElementById("profileModal");

if(profileBtn){

profileBtn.addEventListener("click", function(e){

e.preventDefault();
modal.style.display = "flex";

});

}

}, 200);


/* CLOSE MODAL */

function closeProfile(){
document.getElementById("profileModal").style.display = "none";
}
function saveProfile(){

    const file = document.getElementById("profileInput").files[0];

    if(!file){
        alert("Select an image first");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function(){

        const base64 = reader.result;

        let user = JSON.parse(localStorage.getItem("user"));

        const res = await fetch(`${BASE_URL}/api/update-profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: user.email,
                profilePic: base64
            })
        });

        const data = await res.json();

        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Profile updated successfully");

        location.reload();
    };

    reader.readAsDataURL(file);
}

/* ===================================
   DYNAMIC COURSES & VIDEO MODAL LOGIC
   =================================== */

// Plays the selected course video in a custom modal
function playCourseVideo(videoUrl) {
    let modal = document.getElementById("courseVideoModal");
    let videoPlayer = document.getElementById("courseVideoPlayer");
    let videoSource = document.getElementById("courseVideoSource");

    // Create the modal dynamically if it doesn't exist in the HTML
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "courseVideoModal";
        modal.className = "video-modal active";
        Object.assign(modal.style, {
            position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.85)", zIndex: "9999", display: "flex",
            alignItems: "center", justifyContent: "center", opacity: "1"
        });

        const overlay = document.createElement("div");
        overlay.id = "courseVideoOverlay";
        overlay.className = "video-overlay";
        Object.assign(overlay.style, {
            position: "absolute", width: "100%", height: "100%", cursor: "pointer"
        });

        const content = document.createElement("div");
        content.className = "video-content";
        Object.assign(content.style, {
            position: "relative", width: "90%", maxWidth: "800px", zIndex: "10000"
        });

        const closeBtn = document.createElement("span");
        closeBtn.id = "closeCourseVideo";
        closeBtn.innerHTML = "&times;";
        Object.assign(closeBtn.style, {
            position: "absolute", top: "-40px", right: "0", color: "#fff",
            fontSize: "30px", cursor: "pointer"
        });

        videoPlayer = document.createElement("video");
        videoPlayer.id = "courseVideoPlayer";
        videoPlayer.controls = true;
        Object.assign(videoPlayer.style, {
            width: "100%", borderRadius: "8px", backgroundColor: "#000"
        });

        videoSource = document.createElement("source");
        videoSource.id = "courseVideoSource";
        videoSource.type = "video/mp4";

        videoPlayer.appendChild(videoSource);
        content.appendChild(closeBtn);
        content.appendChild(videoPlayer);
        modal.appendChild(overlay);
        modal.appendChild(content);
        document.body.appendChild(modal);

        const closePlayer = () => {
            modal.style.display = "none";
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        };

        closeBtn.addEventListener("click", closePlayer);
        overlay.addEventListener("click", closePlayer);
    }

    if (modal && videoPlayer && videoSource) {
        modal.style.display = "flex";
        videoSource.src = videoUrl;
        videoPlayer.load();
        
        videoPlayer.play().catch(err => console.log("Playback interaction error:", err));
    }
}

// Fetches courses from server and prepends them dynamically
async function loadCourses() {
    const grid = document.querySelector(".courses-grid");
    if (!grid) return;

    try {
        const res = await fetch(`${BASE_URL}/api/courses`);
        const courses = await res.json();

        courses.forEach(course => {
            const card = document.createElement("div");
            card.className = "course-card";
            
            // Format price logic
            const priceVal = parseFloat(course.price || 0);
            const formattedPrice = priceVal === 0 ? "Free" : "$" + priceVal.toFixed(2);

            card.innerHTML = `
                <div class="course-img" style="position: relative; cursor: pointer; overflow: hidden;">
                    <span class="tag new" style="background: #818cf8; color: #fff;">Dynamic</span>
                    <img src="${course.thumbnail}" alt="${course.title}">
                    <div class="play-overlay">
                        <i class='bx bx-play'></i>
                    </div>
                </div>
                <div class="course-body">
                    <h3>${course.title}</h3>
                    <p class="author">${course.instructor || "Expert Instructor"}</p>
                    <p class="desc" style="font-size: 13px; color: #9ca3af; margin-bottom: 15px; min-height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">
                        ${course.description || "No description provided."}
                    </p>
                    <div class="course-footer">
                        <span class="price">${formattedPrice}</span>
                        <button class="watch-btn" data-video="${course.video}" style="background: #6366f1;">Watch Video</button>
                    </div>
                </div>
            `;

            // Hover and click listeners
            const imgContainer = card.querySelector(".course-img");
            const watchBtn = card.querySelector(".watch-btn");

            const triggerPlay = (e) => {
                e.preventDefault();
                e.stopPropagation();
                playCourseVideo(course.video);
            };

            if (imgContainer) imgContainer.addEventListener("click", triggerPlay);
            if (watchBtn) watchBtn.addEventListener("click", triggerPlay);

            // Prepend new course cards to the top of the grid
            grid.prepend(card);
        });
    } catch (error) {
        console.error("Failed to load and render custom courses:", error);
    }
}

// Bind modal controls and initialize on load
function initCourseApp() {
    const modal = document.getElementById("courseVideoModal");
    const videoPlayer = document.getElementById("courseVideoPlayer");
    const closeBtn = document.getElementById("closeCourseVideo");
    const overlay = document.getElementById("courseVideoOverlay");

    const closePlayer = () => {
        if (modal && videoPlayer) {
            modal.classList.remove("active");
            modal.style.display = "none";
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        }
    };

    if (closeBtn) closeBtn.addEventListener("click", closePlayer);
    if (overlay) overlay.addEventListener("click", closePlayer);

    // Call dynamic courses rendering
    loadCourses();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCourseApp);
} else {
    initCourseApp();
}