
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Frontend files
app.use(express.static(path.join(__dirname, "..")));

// Open Login Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index/login.html"));
});

// MongoDB Schemas
const recordSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

const supplierSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

// MongoDB Models
const Record = mongoose.model("Record", recordSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);

// RECORD SAVE
app.post("/api/record", async (req, res) => {
    try {
        await Record.create(req.body);
        res.json({ message: "Record Saved" });
    } catch (err) {
        console.error("Record Error:", err);
        res.status(500).json({ message: "Record Save Failed" });
    }
});

// RECORD GET
app.get("/api/record", async (req, res) => {
    try {
        const data = await Record.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Record Error:", err);
        res.status(500).json({ message: "Record Load Failed" });
    }
});

// SUPPLIER SAVE
app.post("/api/supplier", async (req, res) => {
    try {
        await Supplier.create(req.body);
        res.json({ message: "Supplier Saved" });
    } catch (err) {
        console.error("Supplier Error:", err);
        res.status(500).json({ message: "Supplier Save Failed" });
    }
});

// SUPPLIER GET
app.get("/api/supplier", async (req, res) => {
    try {
        const data = await Supplier.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("Supplier Error:", err);
        res.status(500).json({ message: "Supplier Load Failed" });
    }
});

// SERVER + MONGODB CONNECTION
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "shivalkar_dairy"
        });

        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

startServer();
