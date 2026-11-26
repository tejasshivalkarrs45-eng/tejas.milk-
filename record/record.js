
const API_URL = "https://shivalkar-dairy-backend.onrender.com/api/customer";

let customerData = [];

// ELEMENTS
const tableData = document.getElementById("tableData");
const customerModal = document.getElementById("customerModal");
const customerForm = document.getElementById("customerForm");

// OPEN CUSTOMER MODAL
function openCustomerModal(customer = null) {
    customerForm.reset();

    document.getElementById("customerRecordId").value =
        customer?._id || "";

    document.getElementById("customerName").value =
        customer?.name || "";

    document.getElementById("customerMobile").value =
        customer?.mobile || "";

    document.getElementById("customerAddress").value =
        customer?.address || "";

    document.getElementById("customerRate").value =
        customer?.rate ?? "";

    document.getElementById("customerModalTitle").textContent =
        customer ? "Edit Customer" : "Add New Customer";

    document.getElementById("saveCustomerButton").textContent =
        customer ? "Update Customer" : "Save Customer";

    customerModal.hidden = false;
}

// CLOSE MODAL
function closeCustomerModal() {
    customerModal.hidden = true;
    customerForm.reset();
    document.getElementById("customerRecordId").value = "";
}

// BOTH ADD BUTTONS
document.getElementById("addCustomerButton")
    .addEventListener("click", () => openCustomerModal());

document.getElementById("addRecordButton")
    .addEventListener("click", () => openCustomerModal());

document.getElementById("closeCustomerModal")
    .addEventListener("click", closeCustomerModal);

document.getElementById("cancelCustomerButton")
    .addEventListener("click", closeCustomerModal);

// LOAD CUSTOMERS
async function loadCustomers() {
    tableData.innerHTML =
        `<tr><td colspan="4">Loading Customers...</td></tr>`;

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Customer Load Failed");
        }

        customerData = Array.isArray(result)
            ? result
            : Array.isArray(result.data)
                ? result.data
                : [];

        showCustomers(customerData);
        updateSummary();

    } catch (error) {
        console.error(error);

        tableData.innerHTML =
            `<tr><td colspan="4">Customer Load नहीं हुए। Login और Server जाँचें।</td></tr>`;
    }
}

// SHOW CUSTOMERS
function showCustomers(data) {
    tableData.innerHTML = "";

    document.getElementById("recordCount").textContent =
        `Showing ${data.length} Records`;

    if (data.length === 0) {
        tableData.innerHTML =
            `<tr><td colspan="4">कोई Customer उपलब्ध नहीं है।</td></tr>`;
        return;
    }

    data.forEach((customer, index) => {
        const row = document.createElement("tr");

        const serialCell = document.createElement("td");
        serialCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = customer.name || "";

        const dateCell = document.createElement("td");
        dateCell.textContent = customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString("en-IN")
            : "-";

        const actionCell = document.createElement("td");

      
// VIEW CUSTOMER PROFILE
const viewButton = document.createElement("button");
viewButton.textContent = "View";
viewButton.className = "view-btn";

viewButton.addEventListener("click", () => {
    const profileModal = document.getElementById("customerProfileModal");

    document.getElementById("profileName").textContent =
        customer.name || "Customer Name";

    document.getElementById("profileCustomerId").textContent =
        "Customer ID: " + (customer.customerId || "-");

    document.getElementById("profileMobile").textContent =
        customer.mobile || "-";

    document.getElementById("profileAddress").textContent =
        customer.address || "-";

    document.getElementById("profileRate").textContent =
        "₹" + (customer.rate ?? 0) + " / Litre";

    document.getElementById("profileStatus").textContent =
        customer.status || "ACTIVE";

    document.getElementById("profileEditButton").onclick = () => {
        profileModal.hidden = true;
        openCustomerModal(customer);
    };

    document.getElementById("profileDeleteButton").onclick = () => {
        profileModal.hidden = true;
        deleteCustomer(customer._id);
    };

    profileModal.hidden = false;
});

// CLOSE CUSTOMER PROFILE
document.getElementById("closeProfileModal")
    .addEventListener("click", () => {
        document.getElementById("customerProfileModal").hidden = true;
    });

        // EDIT
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            openCustomerModal(customer);
        });

        // DELETE
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteCustomer(customer._id);
        });

        actionCell.append(viewButton, editButton, deleteButton);

        row.append(serialCell, nameCell, dateCell, actionCell);
        tableData.appendChild(row);
    });
}

// ADD / UPDATE CUSTOMER
customerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("customerRecordId").value;

    const customer = {
        name: document.getElementById("customerName").value.trim(),
        mobile: document.getElementById("customerMobile").value.trim(),
        address: document.getElementById("customerAddress").value.trim(),
        rate: Number(document.getElementById("customerRate").value)
    };

    if (!customer.name || !Number.isFinite(customer.rate) || customer.rate < 0) {
        alert("कृपया Customer Name और सही Milk Rate भरें।");
        return;
    }

    const saveButton = document.getElementById("saveCustomerButton");
    saveButton.disabled = true;

    try {
        const response = await fetch(
            id ? `${API_URL}/${encodeURIComponent(id)}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customer)
            }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Save Failed");
        }

        alert(id
            ? "Customer सफलतापूर्वक Update हुआ!"
            : "Customer सफलतापूर्वक Save हुआ!");

        closeCustomerModal();
        await loadCustomers();

    } catch (error) {
        console.error(error);
        alert(error.message || "Customer Save नहीं हुआ।");
    } finally {
        saveButton.disabled = false;
    }
});

// DELETE CUSTOMER
async function deleteCustomer(id) {
    if (!id) {
        alert("Customer ID उपलब्ध नहीं है।");
        return;
    }

    if (!confirm("क्या आप इस Customer को Delete करना चाहते हैं?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Delete Failed");
        }

        alert("Customer Delete हो गया।");
        await loadCustomers();

    } catch (error) {
        console.error(error);
        alert(error.message || "Customer Delete नहीं हुआ।");
    }
}

// SEARCH
document.getElementById("search").addEventListener("input", function() {
    const searchText = this.value.toLowerCase().trim();

    const filtered = customerData.filter(customer =>
        String(customer.name || "").toLowerCase().includes(searchText) ||
        String(customer.mobile || "").includes(searchText) ||
        String(customer.customerId || "").toLowerCase().includes(searchText)
    );

    showCustomers(filtered);
});

// SUMMARY
function updateSummary() {
    document.getElementById("totalCustomers").textContent =
        customerData.length;
}

// TABS
document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(tab => {
            tab.classList.remove("active");
        });

        document.querySelectorAll(".tab-panel").forEach(panel => {
            panel.classList.remove("active");
            panel.hidden = true;
        });

        button.classList.add("active");

        const panel = document.getElementById(button.dataset.tab);

        if (panel) {
            panel.hidden = false;
            panel.classList.add("active");
        }
    });
});

// NOTIFICATIONS
const notificationButton =
    document.getElementById("notificationButton");

const notificationPopup =
    document.getElementById("notificationPopup");

notificationButton.addEventListener("click", () => {
    notificationPopup.hidden = !notificationPopup.hidden;

    notificationButton.setAttribute(
        "aria-expanded",
        String(!notificationPopup.hidden)
    );
});

document.getElementById("closeNotifications")
    .addEventListener("click", () => {
        notificationPopup.hidden = true;
        notificationButton.setAttribute("aria-expanded", "false");
    });

document.getElementById("markAllRead")
    .addEventListener("click", () => {
        document.getElementById("notificationCount").textContent = "0";
        document.getElementById("notificationList").innerHTML =
            `<div class="notification-empty">अभी कोई Notification नहीं है।</div>`;
    });

    // REGULAR MILK ENTRY FORM
document.querySelector('[data-category="regular"]')
    .addEventListener("click", () => {

        const milkEntryArea = document.getElementById("milkEntryArea");

        if (customerData.length === 0) {
            milkEntryArea.innerHTML =
                "<p>पहले Add Customer से Customer सेव करें।</p>";
            return;
        }

        milkEntryArea.innerHTML = `
            <div class="milk-entry-form">
                <h3>🥛 Regular Milk Entry</h3>

                <label>Customer Name</label>
                <select id="milkCustomer" required>
                    <option value="">Select Customer</option>
                    ${customerData.map(c => `
                        <option value="${c._id}">
                            ${c.name} (${c.customerId || "-"})
                        </option>
                    `).join("")}
                </select>

                <p>Customer ID: <strong id="milkCustomerId">-</strong></p>

                <label>Date</label>
                <input type="date" id="milkDate" required>

                <label>Morning Milk (Litre)</label>
                <input type="number" id="morningMilk" min="0" step="0.01">

                <label>Evening Milk (Litre)</label>
                <input type="number" id="eveningMilk" min="0" step="0.01">

                <p>Total Milk: <strong id="totalMilkEntry">0 L</strong></p>

                <p>Milk Rate: <strong id="milkRateEntry">₹0</strong></p>

                <p>Total Amount: <strong id="milkAmountEntry">₹0</strong></p>

                <button type="button" id="saveRegularMilk">
                    Save Regular Entry
                </button>
            </div>
        `;

        document.getElementById("milkDate").value =
            new Date().toISOString().split("T")[0];

        const customerSelect = document.getElementById("milkCustomer");

        function calculateMilk() {
            const morning = Number(document.getElementById("morningMilk").value) || 0;
            const evening = Number(document.getElementById("eveningMilk").value) || 0;
            const total = morning + evening;

            const selectedCustomer = customerData.find(
                c => c._id === customerSelect.value
            );

            const rate = Number(selectedCustomer?.rate) || 0;

            document.getElementById("milkCustomerId").textContent =
                selectedCustomer?.customerId || "-";

            document.getElementById("milkRateEntry").textContent =
                "₹" + rate.toFixed(2);

            document.getElementById("totalMilkEntry").textContent =
                total.toFixed(2) + " L";

            document.getElementById("milkAmountEntry").textContent =
                "₹" + (total * rate).toFixed(2);
        }

        customerSelect.addEventListener("change", calculateMilk);
        document.getElementById("morningMilk").addEventListener("input", calculateMilk);
        document.getElementById("eveningMilk").addEventListener("input", calculateMilk);

        // SAVE REGULAR MILK ENTRY
document.getElementById("saveRegularMilk").addEventListener("click", async () => {

    const customer = customerData.find(
        c => c._id === customerSelect.value
    );

    const date = document.getElementById("milkDate").value;
    const morning = Number(document.getElementById("morningMilk").value) || 0;
    const evening = Number(document.getElementById("eveningMilk").value) || 0;

    if (!customer) {
        alert("पहले Customer चुनें।");
        return;
    }

    if (!date || (morning <= 0 && evening <= 0)) {
        alert("Date और दूध की मात्रा भरें।");
        return;
    }

    const totalMilk = morning + evening;
    const rate = Number(customer.rate) || 0;

    const record = {
        entryType: "regular",
        customerId: customer.customerId,
        customerMongoId: customer._id,
        customerName: customer.name,
        date: date,
        morningMilk: morning,
        eveningMilk: evening,
        totalMilk: totalMilk,
        rate: rate,
        totalAmount: totalMilk * rate
    };

    const saveButton = document.getElementById("saveRegularMilk");
    saveButton.disabled = true;

    try {
        const response = await fetch(
            "https://shivalkar-dairy-backend.onrender.com/api/record",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(record)
            }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Record Save Failed");
        }

        alert("Regular Milk Entry सफलतापूर्वक Save हुई!");

    } catch (error) {
        console.error(error);
        alert(error.message || "Entry Save नहीं हुई।");
    } finally {
        saveButton.disabled = false;
    }
});
    });
    
// INITIAL LOAD
loadCustomers();
