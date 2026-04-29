/* ===== EDUCHAIN PLUS - INTERACTIVE JS ===== */

(function () {
    "use strict";

    /* ---------- BILLING TOGGLE ---------- */
    const billingToggle = document.getElementById("billingToggle");
    const monthlyLabel = document.getElementById("monthlyLabel");
    const yearlyLabel = document.getElementById("yearlyLabel");

    function updatePrices() {
        const isYearly = billingToggle.checked;
        const amounts = document.querySelectorAll(".amount");
        const periods = document.querySelectorAll(".period");

        monthlyLabel.classList.toggle("active-label", !isYearly);
        yearlyLabel.classList.toggle("active-label", isYearly);

        amounts.forEach(el => {
            const target = isYearly ? el.dataset.yearly : el.dataset.monthly;
            animateNumber(el, parseInt(el.textContent), parseInt(target));
        });

        periods.forEach(el => {
            el.textContent = isYearly ? "/month (billed yearly)" : "/month";
        });
    }

    function animateNumber(el, from, to) {
        const duration = 400;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + (to - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (billingToggle) {
        billingToggle.addEventListener("change", updatePrices);
        monthlyLabel.classList.add("active-label");
    }

    /* ---------- PLAN SELECTION ---------- */
    let selectedPlan = null;

    window.handlePlan = function (plan) {
        if (plan === "free") {
            showToast("You're already on the Free plan!", "info");
            return;
        }

        selectedPlan = plan;
        const isYearly = billingToggle && billingToggle.checked;
        const prices = { plus: { m: 19, y: 11 }, pro: { m: 39, y: 23 } };
        const price = isYearly ? prices[plan].y : prices[plan].m;
        const billing = isYearly ? "Yearly" : "Monthly";
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

        document.getElementById("paymentTitle").textContent = "Upgrade to " + planName;
        document.getElementById("psPlan").textContent = planName;
        document.getElementById("psBilling").textContent = billing;
        document.getElementById("psTotal").textContent = "$" + price + "/mo";

        // Pre-fill name from user
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.name) {
            document.getElementById("cardName").value = user.name;
        }

        document.getElementById("paymentModal").classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.closePayment = function () {
        document.getElementById("paymentModal").classList.remove("active");
        document.body.style.overflow = "";
        document.getElementById("paymentForm").reset();
    };

    /* ---------- CARD INPUT FORMATTING ---------- */
    const cardNumberInput = document.getElementById("cardNumber");
    const cardExpiryInput = document.getElementById("cardExpiry");
    const cardCvvInput = document.getElementById("cardCvv");

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", function (e) {
            let v = e.target.value.replace(/\D/g, "").substring(0, 16);
            e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", function (e) {
            let v = e.target.value.replace(/\D/g, "").substring(0, 4);
            if (v.length >= 2) v = v.substring(0, 2) + "/" + v.substring(2);
            e.target.value = v;
        });
    }

    if (cardCvvInput) {
        cardCvvInput.addEventListener("input", function (e) {
            e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
        });
    }

    /* ---------- PAYMENT PROCESSING ---------- */
    window.processPayment = function (e) {
        e.preventDefault();

        const btn = document.getElementById("payBtn");
        const textEl = btn.querySelector(".pay-text");
        const loaderEl = btn.querySelector(".pay-loader");

        // Validate
        const cardNum = cardNumberInput.value.replace(/\s/g, "");
        if (cardNum.length < 16) {
            showToast("Please enter a valid card number", "error");
            return;
        }

        textEl.style.display = "none";
        loaderEl.style.display = "inline-flex";
        btn.disabled = true;

        // Simulate payment
        setTimeout(function () {
            textEl.style.display = "inline";
            loaderEl.style.display = "none";
            btn.disabled = false;

            // Save subscription to localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            if (user) {
                user.plan = selectedPlan;
                user.planDate = new Date().toISOString();
                localStorage.setItem("user", JSON.stringify(user));
            }

            closePayment();
            showSuccess();
        }, 2500);
    };

    function showSuccess() {
        document.getElementById("successModal").classList.add("active");
        document.body.style.overflow = "hidden";

        // Confetti effect
        createConfetti();
    }

    window.closeSuccess = function () {
        document.getElementById("successModal").classList.remove("active");
        document.body.style.overflow = "";
    };

    /* ---------- FAQ ACCORDION ---------- */
    window.toggleFaq = function (btn) {
        const item = btn.parentElement;
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("open");

        // Close all
        document.querySelectorAll(".faq-item").forEach(function (fi) {
            fi.classList.remove("open");
            fi.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isOpen) {
            item.classList.add("open");
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    };

    /* ---------- SCROLL ANIMATIONS ---------- */
    const fadeEls = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });

    /* ---------- FEATURE CARD TILT ---------- */
    document.querySelectorAll(".feature-card").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
            card.style.transform = "translateY(-6px) perspective(600px) rotateX(" + y + "deg) rotateY(" + x + "deg)";
        });
        card.addEventListener("mouseleave", function () {
            card.style.transform = "translateY(0) perspective(600px) rotateX(0) rotateY(0)";
        });
    });

    /* ---------- TOAST NOTIFICATION ---------- */
    function showToast(msg, type) {
        const existing = document.querySelector(".plus-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.className = "plus-toast " + (type || "info");
        toast.innerHTML = '<i class="bx ' + (type === "error" ? "bx-x-circle" : "bx-info-circle") + '"></i> ' + msg;

        Object.assign(toast.style, {
            position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%) translateY(20px)",
            background: type === "error" ? "#dc2626" : "#1b2040",
            color: "#fff", padding: "14px 28px", borderRadius: "12px", fontSize: "14px",
            fontWeight: "500", zIndex: "99999", display: "flex", alignItems: "center", gap: "8px",
            border: "1px solid " + (type === "error" ? "rgba(220,38,38,0.3)" : "rgba(129,140,248,0.25)"),
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)", opacity: "0", transition: "all 0.35s ease"
        });

        document.body.appendChild(toast);
        requestAnimationFrame(function () {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
        });

        setTimeout(function () {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(20px)";
            setTimeout(function () { toast.remove(); }, 350);
        }, 3000);
    }

    /* ---------- CONFETTI ---------- */
    function createConfetti() {
        var colors = ["#6366f1", "#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24"];
        for (var i = 0; i < 50; i++) {
            (function (idx) {
                var c = document.createElement("div");
                c.style.cssText =
                    "position:fixed;width:8px;height:8px;border-radius:2px;z-index:100000;pointer-events:none;" +
                    "background:" + colors[idx % colors.length] + ";" +
                    "left:" + (Math.random() * 100) + "vw;" +
                    "top:-10px;opacity:1;";
                document.body.appendChild(c);

                var x = (Math.random() - 0.5) * 200;
                var duration = 1500 + Math.random() * 1500;
                var delay = Math.random() * 500;

                setTimeout(function () {
                    c.style.transition = "all " + duration + "ms cubic-bezier(.25,.46,.45,.94)";
                    c.style.transform = "translateX(" + x + "px) translateY(100vh) rotate(" + (Math.random() * 720) + "deg)";
                    c.style.opacity = "0";
                    setTimeout(function () { c.remove(); }, duration + 100);
                }, delay);
            })(i);
        }
    }

    /* ---------- LOGIN AVATAR (shared from index) ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const nav = document.getElementById("navActions");
        const signin = nav.querySelector(".signin");
        const signup = nav.querySelector(".btn-primary");
        if (signin) signin.style.display = "none";
        if (signup) signup.style.display = "none";

        const avatarContainer = document.createElement("div");
        avatarContainer.className = "avatar-container";
        avatarContainer.innerHTML =
            '<div class="avatar" id="avatarBtn" title="' + user.name + '">' +
            (user.profilePic ? '<img src="' + user.profilePic + '" alt="avatar">' : user.name.charAt(0).toUpperCase()) +
            '</div>' +
            '<div class="avatar-dropdown" id="avatarMenu">' +
            '<div class="avatar-info"><strong>' + user.name + '</strong><span>' + user.email + '</span></div>' +
            '<a href="dashboard.html">Dashboard</a>' +
            '<a href="#" id="openProfile">Profile</a>' +
            '<a href="#" id="logoutBtn">Logout</a>' +
            '</div>';
        nav.appendChild(avatarContainer);

        document.getElementById("avatarBtn").addEventListener("click", function (e) {
            e.stopPropagation();
            document.getElementById("avatarMenu").classList.toggle("show-menu");
        });

        document.addEventListener("click", function () {
            var menu = document.getElementById("avatarMenu");
            if (menu) menu.classList.remove("show-menu");
        });

        document.getElementById("logoutBtn").addEventListener("click", function () {
            localStorage.removeItem("user");
            alert("Logged out successfully");
            window.location.href = "/index.html";
        });

        // Show user plan badge
        if (user.plan) {
            var badge = document.querySelector(".btn-plus");
            if (badge) {
                badge.textContent = "✨ " + user.plan.charAt(0).toUpperCase() + user.plan.slice(1) + " Member";
                badge.style.pointerEvents = "none";
            }
        }
    });

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
            var target = document.querySelector(this.getAttribute("href"));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

})();
