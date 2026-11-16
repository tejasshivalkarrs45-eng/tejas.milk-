
async function loadRecords() {
    try {
        const response = await fetch(
            "https://shivalkar-dairy-backend.onrender.com/api/record"
        );

        if (!response.ok) {
            throw new Error("Data load nahi hua");
        }

        const data = await response.json();
        const table = document.getElementById("tableData");

        table.innerHTML = "";

        data.forEach((item, index) => {
            const morning = Number(item.morning) || 0;
            const evening = Number(item.evening) || 0;
            const totalMilk = morning + evening;
            const amount = totalMilk * (Number(item.rate) || 0);

            table.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ""}</td>
                    <td>${item.mobile || ""}</td>
                    <td>${morning}</td>
                    <td>${evening}</td>
                    <td>${totalMilk}</td>
                    <td>₹${amount.toFixed(2)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Record Error:", error);
        alert("Record load nahi ho paya. Server check karein.");
    }
}

loadRecords();
