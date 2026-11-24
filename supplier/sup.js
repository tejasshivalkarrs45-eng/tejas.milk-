
const API_URL = "https://shivalkar-dairy-backend.onrender.com/api/supplier";

let supplierData = [];

function showPopup(message, type = "success", showCancel = false) {
    return new Promise(resolve => {
        const oldPopup = document.getElementById("customPopupOverlay");
        if (oldPopup) oldPopup.remove();

        const overlay = document.createElement("div");
        overlay.id = "customPopupOverlay";

        const box = document.createElement("div");
        box.className = "custom-popup";

        const icon = document.createElement("div");
        icon.className = `popup-icon ${type === "error" ? "error" : "success"}`;
        icon.textContent = type === "error" ? "!" : showCancel ? "?" : "✓";

        const heading = document.createElement("h2");
        heading.textContent = showCancel ? "क्या आप सुनिश्चित हैं?" :
            type === "error" ? "ध्यान दें!" : "सफलता!";

        const text = document.createElement("p");
        text.textContent = message;

        const actions = document.createElement("div");
        actions.className = "popup-actions";

        function close(result) {
            overlay.classList.add("popup-hide");
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 200);
        }

        if (showCancel) {
            const cancel = document.createElement("button");
            cancel.className = "popup-cancel";
            cancel.textContent = "Cancel";
            cancel.onclick = () => close(false);
            actions.appendChild(cancel);
        }

        const ok = document.createElement("button");
        ok.className = "popup-ok";
        ok.textContent = showCancel ? "हाँ, जारी रखें" : "ठीक है";
        ok.onclick = () => close(true);

        actions.appendChild(ok);
        box.append(icon, heading, text, actions);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
}

function displayMilk(value) {
    return value === undefined || value === null || value === ""
        ? "--"
        : Number(value).toFixed(2) + " L";
}

function openSupplierBill(item) {
    const morningPresent = item.morning !== undefined &&
        item.morning !== null && item.morning !== "";

    const eveningPresent = item.evening !== undefined &&
        item.evening !== null && item.evening !== "";

    const morning = morningPresent ? Number(item.morning) || 0 : 0;
    const evening = eveningPresent ? Number(item.evening) || 0 : 0;
    const totalMilk = morning + evening;

    const amount = Number(item.amount) || 0;
    const rate = Number(item.rate) ||
        (totalMilk > 0 ? amount / totalMilk : 0);

    const supplierName = String(item.name || "Supplier")
        .replace(/[^a-zA-Z0-9-अ-ह]/g, "_");

    const pdfFileName =
        `Shivalkar_${supplierName}_${item.date || "Bill"}.pdf`;

    const billWindow = window.open("", "_blank");

    if (!billWindow) {
        showPopup("कृपया इस वेबसाइट के लिए Pop-ups की अनुमति दें।", "error");
        return;
    }

    const billHTML = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Milk Bill</title>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>

        <style>
            * { box-sizing: border-box; }

            body {
                font-family: Arial, sans-serif;
                background: #f1f5f2;
                padding: 25px;
                color: #26372d;
            }

            .bill {
                max-width: 750px;
                margin: 20px auto;
                background: white;
                padding: 35px;
                border-radius: 12px;
                box-shadow: 0 5px 25px #0001;
            }

            .brand {
                text-align: center;
                color: #087744;
                border-bottom: 2px solid #087744;
                padding-bottom: 20px;
            }

            .brand h1 { margin: 0; letter-spacing: 2px; }
            .brand p { margin: 7px 0; letter-spacing: 3px; }

            .bill-title {
                text-align: center;
                margin: 22px 0;
                color: #087744;
            }

            .details {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }

            th, td {
                padding: 14px;
                border: 1px solid #dce5de;
                text-align: left;
            }

            th { background: #087744; color: white; }

            .total {
                margin-top: 25px;
                padding: 18px;
                background: #e8f7ee;
                text-align: right;
                color: #087744;
                font-size: 23px;
                font-weight: bold;
            }

            .thanks {
                text-align: center;
                margin-top: 35px;
                color: #718078;
            }

            .bill-actions {
                display: flex;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
                margin: 25px auto;
            }

            .bill-actions button {
                padding: 12px 22px;
                color: white;
                border: 0;
                border-radius: 8px;
                cursor: pointer;
                font-size: 15px;
            }

            .print-btn { background: #087744; }
            .share-btn { background: #168b49; }

            .bill-actions button:disabled {
                opacity: 0.6;
                cursor: wait;
            }

            @media (max-width: 600px) {
                body { padding: 8px; }
                .bill { padding: 18px; }
                th, td { padding: 8px; font-size: 13px; }
            }

            @media print {
                body { background: white; padding: 0; }
                .bill {
                    box-shadow: none;
                    margin: 0 auto;
                    max-width: 100%;
                }
                .bill-actions { display: none !important; }
            }

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 30px 15px;
    font-family: "Segoe UI", Arial, sans-serif;
    color: #24382c;
    background: linear-gradient(135deg, #e8f5e9, #f7f9ed, #dcefe3);
    background-size: 300% 300%;
    animation: backgroundMove 12s ease infinite;
}

@keyframes backgroundMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.bill {
    position: relative;
    max-width: 780px;
    margin: 20px auto;
    padding: 42px;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #dceadd;
    border-radius: 22px;
    box-shadow: 0 20px 55px rgba(20, 75, 42, 0.15);
    animation: billAppear 0.8s ease both;
}

@keyframes billAppear {
    from {
        opacity: 0;
        transform: translateY(35px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.bill::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background: linear-gradient(90deg, #075c35, #d6a83d, #087b48);
}

.brand {
    position: relative;
    text-align: center;
    padding: 15px 10px 25px;
    color: #08643a;
    border-bottom: 2px dashed #c6ddcc;
}

.brand h1 {
    margin: 0;
    font-size: 38px;
    font-weight: 900;
    letter-spacing: 3px;
    animation: brandGlow 3s ease-in-out infinite;
}

@keyframes brandGlow {
    0%, 100% { text-shadow: 0 0 0 transparent; }
    50% { text-shadow: 0 3px 18px #b5dfc2; }
}

.brand p {
    margin: 8px 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 5px;
    color: #b18a31;
}

.brand small {
    color: #718578;
    letter-spacing: 1px;
}

.bill-title {
    display: table;
    margin: 28px auto;
    padding: 10px 28px;
    color: #ffffff;
    font-size: 21px;
    letter-spacing: 2px;
    background: linear-gradient(120deg, #075c35, #149456);
    border-radius: 30px;
    box-shadow: 0 7px 18px #08774435;
}

.details {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin: 22px 0;
    padding: 20px;
    background: linear-gradient(120deg, #f1f8f2, #fffdf5);
    border: 1px solid #e0ebdf;
    border-radius: 14px;
    line-height: 1.7;
}

.details strong {
    color: #075c35;
}

table {
    width: 100%;
    margin-top: 25px;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 5px 18px #0000000c;
}

th {
    padding: 16px 12px;
    color: white;
    text-align: left;
    font-size: 14px;
    background: linear-gradient(120deg, #075c35, #12834b);
}

td {
    padding: 17px 12px;
    border-bottom: 1px solid #e5eee6;
    font-size: 14px;
    transition: background 0.25s, transform 0.25s;
}

tbody tr:nth-child(even) {
    background: #f4faf5;
}

tbody tr:hover td {
    background: #e3f4e7;
    transform: translateX(3px);
}

.total {
    margin-top: 28px;
    padding: 24px;
    color: #ffffff;
    text-align: right;
    font-size: 25px;
    font-weight: 800;
    background: linear-gradient(120deg, #075c35, #159454);
    border-radius: 15px;
    box-shadow: 0 10px 25px #08774435;
    animation: totalAppear 1s ease 0.4s both;
}

@keyframes totalAppear {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
}

.thanks {
    margin-top: 38px;
    padding-top: 22px;
    text-align: center;
    color: #78887d;
    border-top: 1px dashed #cbdccc;
    line-height: 1.8;
}

.thanks strong {
    color: #087744;
    letter-spacing: 2px;
}

.bill-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    margin: 30px auto 5px;
}

.bill-actions button {
    min-width: 175px;
    padding: 14px 22px;
    color: white;
    font-size: 15px;
    font-weight: 700;
    border: 0;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 7px 18px #00000020;
    transition: transform 0.25s, box-shadow 0.25s;
}

.bill-actions button:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px #00000025;
}

.bill-actions button:active {
    transform: scale(0.96);
}

.print-btn {
    background: linear-gradient(120deg, #075c35, #159454);
}

.share-btn {
    background: linear-gradient(120deg, #168c48, #27b765);
}

.bill-actions button:disabled {
    opacity: 0.65;
    cursor: wait;
}

@media (max-width: 600px) {
    body { padding: 10px 5px; }

    .bill {
        padding: 22px 14px;
        border-radius: 15px;
    }

    .brand h1 { font-size: 29px; }
    .brand p { font-size: 12px; letter-spacing: 3px; }
    .bill-title { font-size: 16px; }

    th, td {
        padding: 10px 6px;
        font-size: 11px;
    }

    .details { padding: 14px; }
    .total { font-size: 20px; }

    .bill-actions button {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation: none !important;
        transition: none !important;
    }
}

@media print {
    @page {
        size: A4;
        margin: 12mm;
    }

    body {
        padding: 0;
        background: white;
        animation: none;
    }

    .bill {
        max-width: 100%;
        margin: 0;
        padding: 15px;
        border-radius: 0;
        box-shadow: none;
        animation: none;
    }

    .bill-actions {
        display: none !important;
    }

    tbody tr:hover td {
        transform: none;
    }
}

        </style>
    </head>

    <body>
        <div class="bill" id="billContent">

            <div class="brand">
                <h1>🐄 SHIVALKAR</h1>
                <p>NATURAL DAIRY FARM</p>
                <small>Quality Milk • Trusted Service</small>
            </div>

            <h2 class="bill-title">MILK SUPPLIER BILL</h2>

            <div class="details">
                <div>
                    <strong>Supplier Name:</strong> ${escapeHTML(item.name || "-")}<br><br>
                    <strong>Mobile:</strong> ${escapeHTML(item.mobile || "-")}
                </div>

                <div>
                    <strong>Bill Date:</strong> ${escapeHTML(item.date || "-")}<br><br>
                    <strong>Bill Type:</strong> Daily Bill
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>विवरण</th>
                        <th>दूध (लीटर)</th>
                        <th>रेट</th>
                        <th>राशि</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>सुबह का दूध</td>
                        <td>${morningPresent ? morning.toFixed(2) : "--"}</td>
                        <td>${morningPresent ? "₹" + rate.toFixed(2) : "--"}</td>
                        <td>${morningPresent ? "₹" + (morning * rate).toFixed(2) : "--"}</td>
                    </tr>

                    <tr>
                        <td>शाम का दूध</td>
                        <td>${eveningPresent ? evening.toFixed(2) : "--"}</td>
                        <td>${eveningPresent ? "₹" + rate.toFixed(2) : "--"}</td>
                        <td>${eveningPresent ? "₹" + (evening * rate).toFixed(2) : "--"}</td>
                    </tr>
                </tbody>
            </table>

            <div class="details">
                <strong>कुल दूध: ${totalMilk.toFixed(2)} लीटर</strong>
                <strong>रेट: ₹${rate.toFixed(2)} / लीटर</strong>
            </div>

            <div class="total">
                कुल बिल राशि: ₹${amount.toFixed(2)}
            </div>

            <div class="thanks">
                <p>आपके विश्वास और सहयोग के लिए धन्यवाद!</p>
                <strong>SHIVALKAR NATURAL DAIRY FARM</strong>
            </div>
        </div>

        <div class="bill-actions">
            <button class="print-btn" onclick="window.print()">
                📄 Save / Print PDF
            </button>

            <button class="share-btn" onclick="shareBill()">
                📲 Share PDF
            </button>
        </div>

        <script>
        async function shareBill() {
            const button = document.querySelector(".share-btn");
            const element = document.getElementById("billContent");

            try {
                if (typeof html2pdf === "undefined") {
                    throw new Error("PDF library load नहीं हुई");
                }

                button.disabled = true;
                button.textContent = "PDF तैयार हो रही है...";

                const options = {
                    margin: 8,
                    filename: ${JSON.stringify(pdfFileName)},
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait"
                    }
                };

                const blob = await html2pdf()
                    .set(options)
                    .from(element)
                    .outputPdf("blob");

                const file = new File(
                    [blob],
                    ${JSON.stringify(pdfFileName)},
                    { type: "application/pdf" }
                );

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: "Shivalkar Dairy Milk Bill",
                        text: "आपका दूध का बिल"
                    });
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.href = url;
                    link.download = ${JSON.stringify(pdfFileName)};
                    link.click();

                    setTimeout(() => URL.revokeObjectURL(url), 2000);

                    alert("PDF डाउनलोड हो गई है। अब WhatsApp खोलकर इसे Attach करें।");
                }

            } catch (error) {
                console.error("PDF Share Error:", error);
                alert("PDF शेयर नहीं हो पाई। Print / Save PDF का उपयोग करें।");
            } finally {
                button.disabled = false;
                button.textContent = "📲 Share PDF";
            }
        }
        <\/script>
    </body>
    </html>`;

    billWindow.document.open();
    billWindow.document.write(billHTML);
    billWindow.document.close();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function loadData() {
    const table = document.getElementById("tableData");

    try {
        table.innerHTML = `<tr><td colspan="9">Loading Supplier Data...</td></tr>`;

        const response = await fetch(API_URL, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            table.innerHTML = `<tr><td colspan="9">कृपया Dashboard में दोबारा Login करें।</td></tr>`;
            return;
        }

        if (!response.ok) throw new Error("Data Load Failed");

        const data = await response.json();
        supplierData = Array.isArray(data) ? data : [];

        let totalMilk = 0;
        let totalAmount = 0;

        supplierData.forEach(item => {
            totalMilk += (Number(item.morning) || 0) +
                         (Number(item.evening) || 0);

            totalAmount += Number(item.amount) || 0;
        });

        document.getElementById("totalMilk").textContent =
            totalMilk.toFixed(2) + " L";

        document.getElementById("totalAmount").textContent =
            "₹" + totalAmount.toFixed(2);

        showData(supplierData);

    } catch (error) {
        console.error(error);
        table.innerHTML = `<tr><td colspan="9">डेटा लोड नहीं हुआ।</td></tr>`;
    }
}

function showData(data) {
    const table = document.getElementById("tableData");
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="9">कोई Supplier Data उपलब्ध नहीं है।</td></tr>`;
        return;
    }

    data.forEach(item => {
        const row = document.createElement("tr");

        const values = [
            item.name || "-",
            item.date || "-",
            displayMilk(item.morning),
            displayMilk(item.evening),
            "₹" + (Number(item.amount) || 0).toFixed(2),
            item.mobile || "-"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // WHATSAPP MESSAGE
        const whatsappCell = document.createElement("td");
        const whatsappButton = document.createElement("button");

        whatsappButton.textContent = "WhatsApp";
        whatsappButton.className = "whatsapp-btn";

        whatsappButton.onclick = async () => {
            const mobile = String(item.mobile || "").replace(/\D/g, "");

            if (!mobile) {
                await showPopup("मोबाइल नंबर उपलब्ध नहीं है।", "error");
                return;
            }

            const number = mobile.length === 10 ? "91" + mobile : mobile;

            const message =
                `🐄 *SHIVALKAR NATURAL DAIRY FARM*\n` +
                `*DAILY MILK BILL*\n\n` +
                `Supplier: ${item.name || "-"}\n` +
                `Date: ${item.date || "-"}\n\n` +
                `Morning: ${displayMilk(item.morning)}\n` +
                `Evening: ${displayMilk(item.evening)}\n` +
                `Total Milk: ${(Number(item.morning) || 0) + (Number(item.evening) || 0)} L\n` +
                `Total Amount: ₹${Number(item.amount || 0).toFixed(2)}\n\n` +
                `धन्यवाद!`;

            window.open(
                "https://wa.me/" + number + "?text=" + encodeURIComponent(message),
                "_blank"
            );
        };

        whatsappCell.appendChild(whatsappButton);
        row.appendChild(whatsappCell);

        // DELETE
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.onclick = async () => {
            if (!item._id) {
                await showPopup("इस रिकॉर्ड की ID उपलब्ध नहीं है।", "error");
                return;
            }

            const confirmed = await showPopup(
                "क्या आप यह Supplier Record हटाना चाहते हैं?",
                "success",
                true
            );

            if (!confirmed) return;

            try {
                const result = await fetch(
                    API_URL + "/" + encodeURIComponent(item._id),
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                );

                if (!result.ok) throw new Error("Delete Failed");

                await showPopup("Supplier Record हटा दिया गया।");
                await loadData();

            } catch (error) {
                console.error(error);
                await showPopup(
                    "Delete नहीं हुआ। Server में Delete API जाँचनी होगी।",
                    "error"
                );
            }
        };

        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        // BILL BUTTON
        const billCell = document.createElement("td");
        const billButton = document.createElement("button");

        billButton.textContent = "View Bill";
        billButton.className = "bill-btn";
        billButton.onclick = () => openSupplierBill(item);

        billCell.appendChild(billButton);
        row.appendChild(billCell);

        table.appendChild(row);
    });
}

// SEARCH
const searchBox = document.getElementById("supplierSearch");

if (searchBox) {
    searchBox.addEventListener("input", function () {
        const searchText = this.value.toLowerCase().trim();

        const filteredData = supplierData.filter(item =>
            String(item.name || "").toLowerCase().includes(searchText) ||
            String(item.mobile || "").includes(searchText)
        );

        showData(filteredData);
    });
}

// ================================
// SUPPLIER PERSONAL ID LIST
// ================================

const PROFILE_API_URL =
    "https://shivalkar-dairy-backend.onrender.com/api/supplier-profile";

let supplierProfiles = [];

async function loadSupplierProfiles() {
    const listBox = document.getElementById("supplierProfileList");

    if (!listBox) return;

    listBox.innerHTML = "Supplier List Loading...";

    try {
        const response = await fetch(PROFILE_API_URL, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            listBox.innerHTML =
                "Dashboard Login कीजिए। Supplier List देखने के लिए Login जरूरी है।";
            return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Supplier List Load नहीं हुई।");
        }

        supplierProfiles = result.data || [];
        showSupplierProfiles(supplierProfiles);

    } catch (error) {
        console.error("Supplier Profile Error:", error);
        listBox.innerHTML = "Supplier List Load नहीं हो सकी।";
    }
}


// SUPPLIER PROFILE DISPLAY

function showSupplierProfiles(data) {
    const listBox = document.getElementById("supplierProfileList");

    if (!listBox) return;

    if (!data.length) {
        listBox.innerHTML = "अभी कोई Supplier Personal ID नहीं बनी है।";
        return;
    }

    listBox.innerHTML = data.map((item, index) => `
        <div class="supplier-profile-card">
            <div>
                <h3>${index + 1}. ${escapeHTML(item.name || "")}</h3>
                <p>📱 ${escapeHTML(item.mobile || "मोबाइल नहीं है")}</p>
                <p>✉️ ${escapeHTML(item.email || "Email नहीं है")}</p>
                <p>💰 Rate: ₹${Number(item.rate || 0).toFixed(2)} / लीटर</p>
                <p>📅 ${item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("hi-IN")
                    : "-"}</p>
            </div>
        </div>
    `).join("");
}


// PROFILE SEARCH

const profileSearchBox =
    document.getElementById("supplierProfileSearch");

if (profileSearchBox) {
    profileSearchBox.addEventListener("input", function () {
        const searchText = this.value.toLowerCase().trim();

        const filteredProfiles = supplierProfiles.filter(item =>
            String(item.name || "").toLowerCase().includes(searchText) ||
            String(item.mobile || "").toLowerCase().includes(searchText) ||
            String(item.email || "").toLowerCase().includes(searchText)
        );

        showSupplierProfiles(filteredProfiles);
    });
}

 // ================================
 // ADD NEW SUPPLIER PERSONAL ID
 // ================================

const addSupplierBtn = document.getElementById("addSupplierBtn");
const addSupplierForm = document.getElementById("addSupplierForm");

const saveSupplierProfileBtn =
    document.getElementById("saveSupplierProfileBtn");

const cancelSupplierProfileBtn =
    document.getElementById("cancelSupplierProfileBtn");

if (addSupplierBtn && addSupplierForm) {
    addSupplierBtn.addEventListener("click", function () {
        addSupplierForm.style.display = "block";
        addSupplierForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}

if (cancelSupplierProfileBtn) {
    cancelSupplierProfileBtn.addEventListener("click", function () {
        addSupplierForm.style.display = "none";
    });
}

if (saveSupplierProfileBtn) {
    saveSupplierProfileBtn.addEventListener("click", async function () {

        const name = document.getElementById("newSupplierName").value.trim();
        const mobile = document.getElementById("newSupplierMobile").value.trim();
        const email = document.getElementById("newSupplierEmail").value.trim();
        const rate = document.getElementById("newSupplierRate").value;
        const openingBalance =
            document.getElementById("newSupplierOpening").value || 0;

        if (!name || !mobile || rate === "") {
            await showPopup("नाम, मोबाइल और Rate भरना जरूरी है।", "error");
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            await showPopup("10 अंकों का सही मोबाइल नंबर डालें।", "error");
            return;
        }

        if (
            !Number.isFinite(Number(rate)) ||
            Number(rate) < 0 ||
            !Number.isFinite(Number(openingBalance)) ||
            Number(openingBalance) < 0
        ) {
            await showPopup("Rate और Opening Balance सही भरें।", "error");
            return;
        }

        saveSupplierProfileBtn.disabled = true;
        saveSupplierProfileBtn.textContent = "Saving...";

        try {
            const response = await fetch(PROFILE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    mobile,
                    email,
                    rate: Number(rate),
                    openingBalance: Number(openingBalance)
                })
            });

            const responseText = await response.text();
            let result;

            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Server Response:", responseText);

                throw new Error(
                    "Server से JSON नहीं मिला। HTTP Status: " +
                    response.status +
                    ". Render Backend URL या API Route जाँचनी होगी।"
                );
            }

            if (response.status === 401) {
                throw new Error("कृपया Dashboard में दोबारा Login करें।");
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Supplier सेव नहीं हुआ।"
                );
            }

            addSupplierForm.reset();
            addSupplierForm.style.display = "none";

            await loadSupplierProfiles();

            await showPopup("Supplier Personal ID सफलतापूर्वक बन गई!");

        } catch (error) {
            console.error("Save Supplier Error:", error);
            await showPopup(error.message, "error");

        } finally {
            saveSupplierProfileBtn.disabled = false;
            saveSupplierProfileBtn.textContent = "Save Supplier";
        }
    });
}

loadSupplierProfiles();
loadData();
