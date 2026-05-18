document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("courseForm");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const submitBtn = form.querySelector("button[type='submit']");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Prevent double submission
            submitBtn.disabled = true;
            btnText.innerText = "Uploading Course Content...";
            btnSpinner.style.display = "block";

            // Prepare files & text fields
            const formData = new FormData();
            formData.append("title", document.getElementById("title").value);
            formData.append("instructor", document.getElementById("instructor").value);
            formData.append("price", document.getElementById("price").value);
            formData.append("description", document.getElementById("description").value);

            const thumbnailFile = document.getElementById("thumbnail").files[0];
            const videoFile = document.getElementById("video").files[0];

            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            }
            if (videoFile) {
                formData.append("video", videoFile);
            }

            try {
                const response = await fetch("/api/upload-course", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Success feedback
                    const successMsg = document.createElement("div");
                    successMsg.innerText = "🎉 Course and Video Uploaded Successfully!";
                    successMsg.style.cssText = `
                        background: rgba(16, 185, 129, 0.2);
                        color: #10b981;
                        border: 1px solid #10b981;
                        padding: 14px;
                        border-radius: 10px;
                        margin-top: 15px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 15px;
                    `;
                    form.appendChild(successMsg);

                    btnText.innerText = "Success! Redirecting...";
                    btnSpinner.style.display = "none";

                    // Redirect to home after 2 seconds to see the new course!
                    setTimeout(() => {
                        window.location.href = "/index.html#featured-courses";
                    }, 2000);

                } else {
                    throw new Error(data.message || "Something went wrong.");
                }

            } catch (err) {
                console.error("Upload error:", err);
                alert("Upload failed: " + err.message);
                
                // Reset button state
                submitBtn.disabled = false;
                btnText.innerText = "Upload Course";
                btnSpinner.style.display = "none";
            }
        });
    }
});
