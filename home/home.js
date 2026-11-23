
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // MOBILE NAVBAR MENU
    // =====================================

    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    function closeMenu() {
        navbar?.classList.remove("active");

        if (menuBtn) {
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.innerHTML = "☰";
        }
    }

    menuBtn?.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("active");

        menuBtn.setAttribute("aria-expanded", String(isOpen));
        menuBtn.innerHTML = isOpen ? "✕" : "☰";
    });

    // Menu link पर क्लिक करने के बाद menu बंद
    navbar?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Menu के बाहर क्लिक करने पर बंद
    document.addEventListener("click", (event) => {
        if (
            navbar &&
            menuBtn &&
            !navbar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            closeMenu();
        }
    });


    // =====================================
    // DASHBOARD LOGIN POPUP
    // =====================================

    const popup = document.getElementById("dashboardPopup");
    const closeButton = document.getElementById("closeDashboardPopup");
    const loginForm = document.getElementById("dashboardPopupForm");
    const passwordInput = document.getElementById("dashboardPassword");
    const loginButton = document.getElementById("dashboardLoginButton");
    const message = document.getElementById("dashboardLoginMessage");

    // Dashboard links पर क्लिक करने से Popup खोलें
    if (popup && loginForm) {

        document.querySelectorAll('a[href="/home/dashboard-login.html"]').forEach(link => {

            link.addEventListener("click", (event) => {
                event.preventDefault();

                closeMenu();

                popup.classList.add("show");
                document.body.style.overflow = "hidden";

                if (message) message.textContent = "";
                if (passwordInput) passwordInput.value = "";

                setTimeout(() => passwordInput?.focus(), 200);
            });

        });

        // Popup बंद करें
        function closePopup() {
            popup.classList.remove("show");
            document.body.style.overflow = "";

            loginForm.reset();

            if (message) message.textContent = "";
        }

        closeButton?.addEventListener("click", closePopup);

        popup.addEventListener("click", (event) => {
            if (event.target === popup) {
                closePopup();
            }
        });

        // सुरक्षित Backend Login
        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const password = passwordInput.value.trim();

            if (!password) {
                message.textContent = "कृपया Password दर्ज करें।";
                return;
            }

            loginButton.disabled = true;
            loginButton.textContent = "PLEASE WAIT...";
            message.textContent = "";

            try {
                const response = await fetch("/api/dashboard-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({ password })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    message.textContent = result.message || "Login असफल!";
                    return;
                }

                message.textContent = "Login सफल! Dashboard खुल रहा है...";

                setTimeout(() => {
                    window.location.href = "/dashboard/dashboard.html";
                }, 500);

            } catch (error) {
                message.textContent = "Server से संपर्क नहीं हो पाया।";

            } finally {
                loginButton.disabled = false;
                loginButton.textContent = "LOGIN TO DASHBOARD";
            }

        });

        // Escape से Popup बंद करें
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closePopup();
                closeMenu();
            }
        });

    } else {
        // Popup न होने पर भी Escape से menu बंद हो
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

});
