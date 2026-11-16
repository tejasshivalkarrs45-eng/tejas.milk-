document.addEventListener("DOMContentLoaded", function () {

    const entryType = document.getElementById("entryType"); 
    const udhariForm = document.getElementById("udhariForm"); 
    const supplierForm = document.getElementById("supplierForm"); 

    // ===== FORM SHOW / HIDE =====
    entryType.addEventListener("change", function() {

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

    // ===== SUPPLIER SAVE =====
    const supplierFormTag = document.querySelector("#supplierForm form");

    if (supplierFormTag) {
        supplierFormTag.addEventListener("submit", function(e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            let data = {
                name: inputs[0].value,
                date: inputs[1].value,
                morning: inputs[2].value,
                evening: inputs[3].value,
                amount: inputs[4].value,
                mobile: inputs[5].value
            };

            fetch("http://localhost:5000/api/supplier", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => {
                alert("Supplier Saved ✅");
                this.reset();
            })
            .catch(err => console.log(err));
        });
    }

    // ===== UDHARI SAVE =====
    const udhariFormTag = document.querySelector("#udhariForm form");

    if (udhariFormTag) {
        udhariFormTag.addEventListener("submit", function(e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            let data = {
                name: inputs[0].value,
                date: inputs[1].value,
                mobile: inputs[2].value,
                morning: inputs[3].value,
                evening: inputs[4].value,
                rate: inputs[5].value
            };

            fetch("http://localhost:5000/api/record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => {
                alert("Record Saved ✅");
                this.reset();
            })
            .catch(err => console.log(err));
        });
    }

});