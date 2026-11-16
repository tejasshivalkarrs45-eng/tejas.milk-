async function loadData() {
    const res = await fetch("http://localhost:5000/api/supplier");
    const data = await res.json();

    const table = document.getElementById("tableData");
    table.innerHTML = "";

    let totalMilk = 0;
    let totalAmount = 0;

    data.forEach(item => {

        const milk = Number(item.morning) + Number(item.evening);
        totalMilk += milk;
        totalAmount += Number(item.amount);

        table.innerHTML += `
        <tr>
            <td>${item.name}</td>
            <td>${item.date}</td>
            <td>${item.morning}</td>
            <td>${item.evening}</td>
            <td>${item.amount}</td>
        </tr>
        `;
    });

    document.getElementById("totalMilk").innerText = totalMilk;
    document.getElementById("totalAmount").innerText = totalAmount;
}

loadData();
// ===== GET SUPPLIER DATA =====

fetch("http://localhost:5000/api/supplier")
.then(res => res.json())
.then(data => {
    console.log("Supplier Data:", data);

    const container = document.getElementById("supplierData");

    data.forEach(item => {
        const div = document.createElement("div");

        div.innerHTML = `
            <p><b>Name:</b> ${item.name}</p>
            <p>Date: ${item.date}</p>
            <p>Morning: ${item.morning} L</p>
            <p>Evening: ${item.evening} L</p>
            <p>Amount: ₹${item.amount}</p>
            <p>Mobile: ${item.mobile}</p>
            <hr>
        `;

        container.appendChild(div);
    });
})
.catch(err => {
    console.error("Error:", err);
});