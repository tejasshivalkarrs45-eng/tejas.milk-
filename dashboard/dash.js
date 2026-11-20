
document.addEventListener("DOMContentLoaded", function () {

    const entryType = document.getElementById("entryType");
    const udhariForm = document.getElementById("udhariForm");
    const supplierForm = document.getElementById("supplierForm");

    const API_URL = "https://shivalkar-dairy-backend.onrender.com";

    // ===== FORM SHOW / HIDE =====
    if (entryType) {
        entryType.addEventListener("change", function () {

            if (this.value === "udhari") {
                udhariForm.style.display = "block";
                supplierForm.style.display = "none";
            }
            else if (this.value === "supplier") {
                supplierForm.style.display = "block";
                udhariForm.style.display = "none";
            }
            else {
                udhariForm.style.display = "none";
                supplierForm.style.display = "none";
            }
        });
    }

    // ===== SUPPLIER SAVE =====
    const supplierFormTag = document.querySelector("#supplierForm form");

    if (supplierFormTag) {
        supplierFormTag.addEventListener("submit", async function (e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            const data = {
                name: inputs[0].value,
                date: inputs[1].value,
                morning: inputs[2].value,
                evening: inputs[3].value,
                amount: inputs[4].value,
                mobile: inputs[5].value
            };

            try {
                const res = await fetch(`${API_URL}/api/supplier`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    throw new Error("Supplier data save nahi hua");
                }

                alert("Supplier Saved ✅");
                this.reset();

            } catch (err) {
                console.error("Supplier Error:", err);
                alert("Supplier save nahi hua. Internet ya server check karein.");
            }
        });
    }

    // ===== UDHARI SAVE =====
    const udhariFormTag = document.querySelector("#udhariForm form");

    if (udhariFormTag) {
        udhariFormTag.addEventListener("submit", async function (e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            const data = {
                name: inputs[0].value,
                date: inputs[1].value,
                mobile: inputs[2].value,
                morning: inputs[3].value,
                evening: inputs[4].value,
                rate: inputs[5].value
            };

            try {
                const res = await fetch(`${API_URL}/api/record`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    throw new Error("Udhari data save nahi hua");
                }

                alert("Record Saved ✅");
                this.reset();

            } catch (err) {
                console.error("Udhari Error:", err);
                alert("Udhari save nahi hua. Internet ya server check karein.");
            }
        });
    }

});
