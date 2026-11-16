fetch("http://localhost:5000/api/record")
.then(res => res.json())
.then(data => {

const table = document.getElementById("tableData");

    table.innerHTML = "";

    data.forEach((item, index) => {
        let row = `
        <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.date}</td>
            <td>${item.mobile}</td>
            <td>${item.morning}</td>
            <td>${item.evening}</td>
            <td>${item.rate}</td>
        </tr>
        `;

        table.innerHTML += row;
    });

})
.catch(err => console.log(err));