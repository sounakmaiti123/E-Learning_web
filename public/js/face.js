document.addEventListener("DOMContentLoaded", () => {

    const startBtn = document.getElementById("startCamera");
    const video = document.getElementById("cameraFeed");

    if (!startBtn || !video) {
        console.warn("Camera elements not found on this page");
        return;
    }

    startBtn.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            video.srcObject = stream;
            await video.play();

            startBtn.textContent = "Camera Active";
            startBtn.disabled = true;

        } catch (err) {
            alert("Camera access denied or unavailable");
            console.error(err);
        }
    });

});
alert("Face Recognition feature will be available soon!");
