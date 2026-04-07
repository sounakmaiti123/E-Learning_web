const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    title: String,
    description: String,
    instructor: String,
    price: Number,
    thumbnail: String,
    createdAt: {
        type: Date,
        default: Date.now
    }

});
const form = document.getElementById("courseForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const course = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            instructor: document.getElementById("instructor").value,
            price: document.getElementById("price").value,
            thumbnail: document.getElementById("thumbnail").value
        };

        try {
            const response = await fetch("/api/upload-course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course)
            });

            const data = await response.json();

            // Better UI message
            const msg = document.createElement("div");
            msg.innerText = "✅ Course Uploaded Successfully!";
            msg.style.color = "#7c8cff";
            msg.style.marginTop = "10px";
            form.appendChild(msg);

            setTimeout(() => msg.remove(), 3000);

            form.reset();

        } catch (err) {
            console.error(err);
            alert("Upload failed!");
        }
    });
}

module.exports = mongoose.model("Course", courseSchema);