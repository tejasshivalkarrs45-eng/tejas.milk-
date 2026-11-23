
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("dashboardPopup");
    const closeButton = document.getElementById("closeDashboardPopup");
    const loginForm = document.getElementById("dashboardPopupForm");
    const passwordInput = document.getElementById("dashboardPassword");
    const loginButton = document.getElementById("dashboardLoginButton");
    const message = document.getElementById("dashboardLoginMessage");

    if (!popup || !loginForm) return;

    // Dashboard links पर क्लिक करने से Popup खोलें
    document.querySelectorAll('a[href="/home/dashboard-login.html"]').forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            popup.classList.add("show");
            document.body.style.overflow = "hidden";
            message.textContent = "";
            passwordInput.value = "";

            setTimeout(() => passwordInput.focus(), 200);
        });
    });

    // Popup बंद करें
    function closePopup() {
        popup.classList.remove("show");
        document.body.style.overflow = "";
        loginForm.reset();
        message.textContent = "";
    }

    closeButton?.addEventListener("click", closePopup);

    popup.addEventListener("click", (event) => {
        if (event.target === popup) closePopup();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && popup.classList.contains("show")) {
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
                window.location.href = "/dashboard/dash.html";
            }, 500);

        } catch (error) {
            message.textContent = "Server से संपर्क नहीं हो पाया।";
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "LOGIN TO DASHBOARD";
        }
    });
});
