console.log("EduChain UI Loaded");

const section = document.querySelector(".learning-content");

window.addEventListener("scroll", () => {
    const sectionTop = section.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (sectionTop < screenHeight - 150) {
        section.classList.add("show");
    }
});
const coursesSection = document.querySelector(".featured-courses");

window.addEventListener("scroll", () => {
    const top = coursesSection.getBoundingClientRect().top;
    const screen = window.innerHeight;

    if (top < screen - 150) {
        coursesSection.classList.add("show");
    }
});
const openBtn = document.getElementById("openVideo");
const modal = document.getElementById("videoModal");
const closeBtn = document.getElementById("closeVideo");
const video = document.getElementById("introVideo");

openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    video.play();
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    video.pause();
    video.currentTime = 0;
});

// Close when clicking outside video
modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("video-overlay")) {
        modal.classList.remove("active");
        video.pause();
        video.currentTime = 0;
    }
});
// Navbar scroll effect
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

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
const signupForm = document.getElementById("signupForm");

if (signupForm) {

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/signup", {

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
fetch("/api/current-user")
.then(res => res.json())
.then(user => {

if(user){

document.querySelector(".signin").style.display = "none";
document.querySelector(".btn-primary").style.display = "none";

const avatar = document.createElement("div");
avatar.className = "avatar";
avatar.innerText = user.name.charAt(0);

document.querySelector(".nav-actions").appendChild(avatar);

}

});

const user = JSON.parse(localStorage.getItem("user"));

if(user){

const signinBtn = document.querySelector(".signin");
const getStartedBtn = document.querySelector(".btn-primary");

if(signinBtn) signinBtn.style.display="none";
if(getStartedBtn) getStartedBtn.style.display="none";

const avatar = document.createElement("div");
avatar.className = "avatar";

if(user.profilePic){

avatar.innerHTML = `<img src="${user.profilePic}" alt="avatar">`;

} else {

avatar.innerText = user.name.charAt(0).toUpperCase();

}

document.querySelector(".nav-actions").appendChild(avatar);

}
/* LOGIN GUARD */

function requireLogin(){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

alert("Please login first");

window.location.href = "/login.html";

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

}

});

});

}, 200);
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

        const res = await fetch("/api/update-profile", {
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