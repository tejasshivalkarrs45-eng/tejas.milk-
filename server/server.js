const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FIXED FILE PATH (IMPORTANT)
const RECORD_FILE = path.join(__dirname, "record.json");
const SUPPLIER_FILE = path.join(__dirname, "supplier.json");

function readData(file) {
    try {
        if (!fs.existsSync(file)) return [];
        
        let data = fs.readFileSync(file, "utf-8");
        
        if (!data) return [];

        return JSON.parse(data);
    } catch (err) {
        console.log("JSON error fix ho gaya");
        return [];
    }
}
// ===== WRITE =====
function writeData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log("Saved in:", file);
    } catch (err) {
        console.log("ERROR:", err);
    }
}

// ===== RECORD SAVE =====
app.post("/api/record", (req, res) => {
    let data = readData(RECORD_FILE);
    data.push(req.body);
    writeData(RECORD_FILE, data);
    res.json({ message: "Record Saved" });
});

// ===== RECORD GET =====
app.get("/api/record", (req, res) => {
    res.json(readData(RECORD_FILE));
});

// ===== SUPPLIER SAVE =====
app.post("/api/supplier", (req, res) => {
    let data = readData(SUPPLIER_FILE);
    data.push(req.body);
    writeData(SUPPLIER_FILE, data);
    res.json({ message: "Supplier Saved" });
});

// ===== SUPPLIER GET =====
app.get("/api/supplier", (req, res) => {
    res.json(readData(SUPPLIER_FILE));
});

// ===== SERVER =====
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});