
const API_URL = "https://shivalkar-dairy-backend.onrender.com/api/record";

let recordData = [];

async function loadRecords() {
    const table = document.getElementById("tableData");

    try {
        table.innerHTML = `<tr><td colspan="10">Loading...</td></tr>`;

        const response = await fetch(API_URL, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Record Load Failed: " + response.status);
        }

        const data = await response.json();
        recordData = Array.isArray(data) ? data : [];

        showRecords(recordData);

    } catch (error) {
        console.error(error);
        table.innerHTML = `<tr><td colspan="10">Record Load नहीं हुआ।</td></tr>`;
    }
}

function showRecords(data) {
    const table = document.getElementById("tableData");
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="10">कोई Record उपलब्ध नहीं है।</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const morning = Number(item.morning) || 0;
        const evening = Number(item.evening) || 0;
        const rate = Number(item.rate) || 0;
        const totalMilk = morning + evening;
        const amount = totalMilk * rate;

        const row = document.createElement("tr");

        const values = [
            index + 1,
            item.name || "",
            item.mobile || "",
            morning,
            evening,
            totalMilk,
            "₹" + amount.toFixed(2)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // EDIT BUTTON
        const editCell = document.createElement("td");
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.onclick = () => {
            document.getElementById("editId").value = item._id;
            document.getElementById("editName").value = item.name || "";
            document.getElementById("editMobile").value = item.mobile || "";
            document.getElementById("editMorning").value = item.morning ?? "";
            document.getElementById("editEvening").value = item.evening ?? "";
            document.getElementById("editRate").value = item.rate ?? "";

            document.getElementById("editForm").style.display = "block";
            document.getElementById("editForm").scrollIntoView({
                behavior: "smooth"
            });
        };

        editCell.appendChild(editButton);
        row.appendChild(editCell);

        // CONTINUE COLUMN
        const continueCell = document.createElement("td");
        continueCell.textContent = "-";
        row.appendChild(continueCell);

        // DELETE BUTTON
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.onclick = async () => {
            if (!item._id) {
                alert("Record ID उपलब्ध नहीं है।");
                return;
            }

            if (!confirm("क्या आप यह Record Delete करना चाहते हैं?")) {
                return;
            }

            try {
                const result = await fetch(
                    API_URL + "/" + encodeURIComponent(item._id),
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                );

                if (!result.ok) {
                    throw new Error("Delete Failed");
                }

                alert("Record Delete हो गया।");
                await loadRecords();

            } catch (error) {
                console.error(error);
                alert("Record Delete नहीं हुआ।");
            }
        };

        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        table.appendChild(row);
    });
}

// UPDATE RECORD
document.getElementById("updateRecordForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;

    const updatedData = {
        name: document.getElementById("editName").value,
        mobile: document.getElementById("editMobile").value,
        morning: Number(document.getElementById("editMorning").value),
        evening: Number(document.getElementById("editEvening").value),
        rate: Number(document.getElementById("editRate").value)
    };

    try {
        const response = await fetch(
            API_URL + "/" + encodeURIComponent(id),
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Update Failed");
        }

        alert("Record सफलतापूर्वक Update हो गया!");

        document.getElementById("editForm").style.display = "none";
        await loadRecords();

    } catch (error) {
        console.error(error);
        alert("Record Update नहीं हुआ।");
    }
});

// CANCEL EDIT
document.getElementById("cancelEdit").addEventListener("click", function() {
    document.getElementById("editForm").style.display = "none";
});

// SEARCH
document.getElementById("search").addEventListener("input", function() {
    const searchText = this.value.toLowerCase().trim();

    const filtered = recordData.filter(item =>
        String(item.name || "").toLowerCase().includes(searchText) ||
        String(item.mobile || "").includes(searchText)
    );

    showRecords(filtered);
});

loadRecords();
