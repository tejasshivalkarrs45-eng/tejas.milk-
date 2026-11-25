
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

        // VIEW
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.className = "view-btn";

        viewButton.addEventListener("click", () => {
            alert(
                "Customer Details\n\n" +
                "Customer ID: " + (customer.customerId || "-") + "\n" +
                "Name: " + (customer.name || "-") + "\n" +
                "Mobile: " + (customer.mobile || "-") + "\n" +
                "Address: " + (customer.address || "-") + "\n" +
                "Milk Rate: ₹" + (customer.rate ?? 0) + "\n" +
                "Status: " + (customer.status || "Active")
            );
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

// INITIAL LOAD
loadCustomers();
